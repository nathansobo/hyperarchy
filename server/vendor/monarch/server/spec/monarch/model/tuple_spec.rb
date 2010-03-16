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

    describe "#add_to_relational_dataset(dataset)" do
      it "writes the record into the relation keyed by the #exposed_name of its relation and its id" do

        relation = BlogPost.project(BlogPost[:id], BlogPost[:title], BlogPost[:body])
        relation.exposed_name = "exposed_posts"
        record = relation.first

        dataset = {}
        record.add_to_relational_dataset(dataset)

        dataset.should == {
          'exposed_posts' => {
            record.id => record.wire_representation
          }
        }
      end
    end
  end
end
