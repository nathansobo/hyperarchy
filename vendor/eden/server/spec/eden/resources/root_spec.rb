require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Resources
  describe Root do
    attr_reader :root
    before do
      @root = Root.new
    end

    describe "#locate" do
      context "when called with 'domain'" do
        it "returns GlobalDomain.instance" do
          root.locate('domain').should == Model::GlobalDomain.instance
        end
      end

      context "when called with 'users'" do
        it "returns an instance of Resources::Users" do
          root.locate('users').should be_an_instance_of(Resources::Users)
        end
      end

      context "when called with 'login'" do
        it "returns an instance of Resources::Login" do
          root.locate('login').should be_an_instance_of(Resources::Login)
        end
      end
    end
  end
end