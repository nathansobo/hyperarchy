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