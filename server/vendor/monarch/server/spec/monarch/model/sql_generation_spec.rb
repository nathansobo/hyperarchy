require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Model
  describe "SQL generation" do
    specify "tables" do
      User.table.to_sql.should == %{select * from users}
      User.where({:full_name => "Amory Lovins", :age => 40}).to_sql.should be_like(%{
        select * from users where users.age = 40 and users.full_name = "Amory Lovins"
      })
      User.where({:age => 40}).project(User[:id], User[:full_name])
    end
  end
end