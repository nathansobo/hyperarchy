require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Models
  describe Ranking do
    describe "after create" do
      before do
        
      end

      it "increments majorities for the ranked candidate over all unranked candidates" do

      end

      it "increments majorities for the newly-ranked candidate over all lower-ranked candidates, and decrements their majorities over the newly-ranked candidate" do

      end

      it "does not modify majorities involving the newly ranked candidate and higher ranked candidates" do
        
      end
    end
  end
end