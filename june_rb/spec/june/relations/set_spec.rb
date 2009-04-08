require File.expand_path("#{File.dirname(__FILE__)}/../june_spec_helper")

module June
  module Relations
    describe Set do

      before do
        @set = User.set
      end

      describe "#insert" do
        it "executes an insert statement against the database for the given Tuple" do
          attributes = { :name => "Nathan", :age => 26 }
          user = User.new(attributes)

          mock(June.origin).insert(:users, attributes)
          set.insert(user)
        end
      end

      describe "#tuples" do
        it "executes a select all SQL query against the database and returns Tuples corresponding to its result"
      end


    end
  end   
end