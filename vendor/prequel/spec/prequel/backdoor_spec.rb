require 'spec_helper'

module Prequel
  describe Backdoor do
    class ::Blog < Record
    end

    class ::BlogPost < Record
    end

    let(:backdoor) { Backdoor.new }

    describe "#get_relation" do
      it "returns the table with the given name" do
        backdoor.get_relation('blogs').should == Blog.table
        backdoor.get_relation('blog_posts').should == BlogPost.table
      end
    end
  end
end
