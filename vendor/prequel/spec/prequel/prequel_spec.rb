require 'spec_helper'

describe Prequel do
  describe ".const_missing" do
    describe "when the DB constant is referenced for the first time" do
      it "assigns it to Sequel::DATABASES.first" do
        Prequel::DB.should == Sequel::DATABASES.first
      end
    end

    describe "when any other constant is referenced" do
      it "raises an error as usual" do
        expect { Prequel::JUNK }.to raise_error(NameError)
      end
    end
  end

  describe ".transaction" do
    it "does not swallow exceptions, but ensure the transaction depth is managed" do
      expect {
        Prequel.transaction do
          raise "boom!"
        end
      }.should raise_error("boom!")
      Prequel.session.transaction_depth.should == 0
    end

    it "manages Prequel.session.transaction_depth" do
      Prequel.session.transaction_depth.should == 0
      Prequel.transaction do
        Prequel.session.transaction_depth.should == 1
        Prequel.transaction do
          Prequel.session.transaction_depth.should == 2
        end
        Prequel.session.transaction_depth.should == 1
      end
      Prequel.session.transaction_depth.should == 0
    end

    it "returns the given block's return value" do
      Prequel.transaction { 7 }.should == 7
    end

    it "clears deferred events on the session once when the transaction is aborted, despite layers of transaction nesting" do
      dont_allow(Prequel.session).flush_deferred_events
      mock(Prequel.session).clear_deferred_events
      Prequel.transaction do
        Prequel.transaction do
          Prequel.session.transaction_depth.should == 2
          raise Prequel::Rollback
        end
      end
      Prequel.session.transaction_depth.should == 0
    end
  end

  describe ".clear_tables" do
    it "clears all tables associated with subclasses of Prequel::Record" do
      class Blog < Prequel::Record
        column :id, :integer
        create_table
      end

      class Post < Prequel::Record
        column :id, :integer
        create_table
      end

      Prequel::DB[:blogs] << { :id => 1 }
      Prequel::DB[:blogs] << { :id => 2 }
      Prequel::DB[:posts] << { :id => 1 }
      Prequel::DB[:posts] << { :id => 2 }

      Prequel.clear_tables

      Prequel::DB[:blogs].should be_empty
      Prequel::DB[:posts].should be_empty
    end
  end

  describe ".clear_session" do
    before do
      Prequel.session
      Thread.current[:prequel_session].should_not be_nil
    end

    context "if test mode is false" do
      before do
        Prequel.test_mode = false
      end

      it "sets the thread-local session variable to nil" do
        Prequel.clear_session
        Thread.current[:prequel_session].should be_nil
      end
    end

    context "if test mode is true" do
      before do
        Prequel.test_mode = true
      end

      it "does not clear the session, and instead only allows clear_session_in_test_mode to do it." do
        Prequel.clear_session
        Thread.current[:prequel_session].should_not be_nil
      end
    end
  end

  describe ".clear_session_in_test_mode" do
    before do
      Prequel.session
      Thread.current[:prequel_session].should_not be_nil
    end

    context "if test mode is true" do
      before do
        Prequel.test_mode = true
      end

      it "clears the session" do
        Prequel.clear_session_in_test_mode
        Thread.current[:prequel_session].should be_nil
      end
    end

    context "if test mode is false" do
      before do
        Prequel.test_mode = false
      end

      it "raises an exception" do
        expect { Prequel.clear_session_in_test_mode }.to raise_error
      end
    end
  end

  describe ".get_subscription_node(klass, name)" do
    it "lazily constructs a subscription node for each class-name, name pairing" do
      class Foo
      end

      class Bar
      end

      foo_node = Prequel.get_subscription_node(Foo, :on_create)
      Prequel.get_subscription_node(Foo, :on_create).should equal(foo_node)
      Prequel.get_subscription_node(Foo, :on_destroy).should_not equal(foo_node)

      bar_node = Prequel.get_subscription_node(Bar, :on_create)
      bar_node.should_not == foo_node

      Object.send(:remove_const, :Foo)
      class Foo
      end
      
      Prequel.get_subscription_node(Foo, :on_create).should equal(foo_node)
    end
  end
end