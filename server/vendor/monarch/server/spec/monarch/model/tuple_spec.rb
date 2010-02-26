require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Model
  describe Tuple do
    describe "#==" do
      it "returns true when passed the same instanec or a different instance of the same class with the same field values" do
        post = BlogPost.find("grain_quinoa")
        relation = BlogPost.project(BlogPost[:title], BlogPost[:body])

        instance_1 = relation.find(BlogPost[:body].eq(post.body))
        instance_2 = relation.find(BlogPost[:body].eq(post.body))

        instance_1.should == instance_1

        instance_1.should_not equal(instance_2)
        instance_1.should == instance_2
      end
    end
  end
end
