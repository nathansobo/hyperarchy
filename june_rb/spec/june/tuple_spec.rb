require File.expand_path("#{File.dirname(__FILE__)}/june_spec_helper")

module June
  describe Tuple do
    describe "when subclassed" do
      it "assigns .set to a new Set with the underscored and pluralized name of the class as its #global_name" do
        User.set.global_name.should == "users"
      end
    end
  end
end