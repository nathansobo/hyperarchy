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
end