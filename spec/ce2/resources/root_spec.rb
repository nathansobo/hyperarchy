require File.expand_path("#{File.dirname(__FILE__)}/../hyperarchy_spec_helper")

module Resources
  describe Root do
    attr_reader :root
    before do
      @root = Root.new
    end

    describe "#locate" do
      context "when passed 'domain'" do
        it "returns GlobalDomain.instance" do
          root.locate('domain').should == GlobalDomain.instance
        end
      end
    end
  end
end