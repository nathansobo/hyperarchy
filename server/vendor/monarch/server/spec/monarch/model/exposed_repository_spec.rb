require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Model
  describe ExposedRepository do
    attr_reader :user, :exposed_repository
    before do
      @user = User.find("jan")
      @exposed_repository = UserRepository.new(user)
    end

    describe ".expose(name, &relation_definition)" do
      it "binds the given relation definition to a table name" do
        exposed_repository.resolve_table_name(:blogs).should == user.blogs
      end
    end

    describe "#get" do
      it "parses the 'relations' paramater from a JSON string into an array of wire representations and performs a #fetch with it, returning the resulting snapshot as a JSON string" do
        relations = [{ "type" => "table", "name" => "blog_posts"}]

        snapshot = nil
        mock.proxy(exposed_repository).fetch(relations) {|result| snapshot = result}
        response = Http::Response.new(*exposed_repository.get({:relations => relations.to_json}))

        response.should be_ok
        response.headers.should == { 'Content-Type' => 'application/json'}
        JSON.parse(response.body).should == { 'successful' => true, 'data' => snapshot} 
      end
    end

    describe "#build_relation_from_wire_representation" do
      it "resolves relation names to primitive Tables" do
        relation = exposed_repository.build_relation_from_wire_representation({
          "type" => "table",
          "name" => "blog_posts"
        })
        relation.should == BlogPost.table
      end
    end

    describe "#build_relation_from_wire_representation" do
      it "delegates to Relation#from_wire_representation with self as the repository" do
        representation = {
          "type" => "table",
          "name" => "blogs"
        }
        mock(Relations::Relation).from_wire_representation(representation, exposed_repository)
        exposed_repository.build_relation_from_wire_representation(representation)
      end
    end

    describe "#fetch" do
      it "populates a relational snapshot with the contents of an array of wire representations of relations" do
        blogs_relation_representation = {
          "type" => "selection",
          "operand" => {
            "type" => "table",
            "name" => "blogs"
          },
          "predicate" => {
            "type" => "eq",
            "left_operand" => {
              "type" => "column",
              "table" => "blogs",
              "name" => "id"
            },
            "right_operand" => {
              "type" => "scalar",
              "value" => "grain"
            }
          }
        }

        blog_posts_relation_representation = {
          "type" => "selection",
          "operand" => {
            "type" => "table",
            "name" => "blog_posts"
          },
          "predicate" => {
            "type" => "eq",
            "left_operand" => {
              "type" => "column",
              "table" => "blog_posts",
              "name" => "blog_id"
            },
            "right_operand" => {
              "type" => "scalar",
              "value" => "grain"
            }
          }
        }

        snapshot = exposed_repository.fetch([blogs_relation_representation, blog_posts_relation_representation])

        blogs_snapshot_fragment = snapshot["blogs"]
        blogs_snapshot_fragment.size.should == 1
        blogs_snapshot_fragment["grain"].should == Blog.find("grain").wire_representation
      end
    end
  end
end
