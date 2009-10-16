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
      it "parses the 'relations' paramater from a JSON string into an array of wire representations and performs a #fetch with it, returning the resulting dataset as a JSON string" do
        relations = [{ "type" => "table", "name" => "blog_posts"}]

        dataset = nil
        mock.proxy(exposed_repository).fetch(relations) {|result| dataset = result}
        response = Http::Response.new(*exposed_repository.get({:relations => relations.to_json}))

        response.should be_ok
        response.headers.should == { 'Content-Type' => 'application/json'}
        JSON.parse(response.body).should == { 'successful' => true, 'data' => dataset}
      end
    end

    describe "#put" do
      it "finds the record with the given 'id' in the given 'relation', then updates it with the given field values and returns all changed field values as its result" do
        record = User.find('jan')
        record.should_not be_dirty

        new_signed_up_at = record.signed_up_at - 1.hours

        response = Http::Response.new(*exposed_repository.put({
          :relation => { "type" => "table", "name" => "users"}.to_json,
          :id => "jan",
          :field_values => {
            :great_name => "Jan Christian Nelson",
            :age => record.age,
            :signed_up_at => new_signed_up_at.to_millis
          }.to_json
        }))

        record.reload
        record.full_name.should == "Jan Christian Nelson The Great"
        record.age.should == 31
        record.signed_up_at.to_millis.should == new_signed_up_at.to_millis
        
        response.should be_ok
        response.body_from_json.should == {
          'successful' => true,
          'data' => {
            'field_values' => {
              'full_name' => "Jan Christian Nelson The Great",
              'signed_up_at' => new_signed_up_at.to_millis
            }
          }
        }
      end
    end

    describe "#post" do
      it "calls #create on the indicated 'relation' with the given 'field_values', then returns all field values as its result" do
        signed_up_at = Time.now

        response = Http::Response.new(*exposed_repository.post({
          :relation => { "type" => "table", "name" => "users"}.to_json,
          :field_values => {
            :great_name => "Sharon Ly",
            :age => 25,
            :signed_up_at => signed_up_at.to_millis
          }.to_json
        }))

        new_record = User.find(User[:full_name].eq('Sharon Ly The Great'))

        response.should be_ok
        response.body_from_json.should == {
          'successful' => true,
          'data' => {
            'field_values' => {
              'id' => new_record.id,
              'full_name' => "Sharon Ly The Great",
              'age' => 25,
              'signed_up_at' => signed_up_at.to_millis
            }
          }
        }
      end
    end

    describe "#build_relation_from_wire_representation" do
      it "resolves relation names to primitive Tables" do
        relation = exposed_repository.build_relation_from_wire_representation({
          "type" => "table",
          "name" => "blog_posts"
        })
        relation.should == exposed_repository.user.blog_posts
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
      it "populates a relational dataset with the contents of an array of wire representations of relations" do
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

        dataset = exposed_repository.fetch([blogs_relation_representation, blog_posts_relation_representation])

        blogs_dataset_fragment = dataset["blogs"]
        blogs_dataset_fragment.size.should == 1
        blogs_dataset_fragment["grain"].should == Blog.find("grain").wire_representation
      end

      it "can populate a dataset from exposed projections" do
        super_blog_posts_relation_representation = {
          "type" => "selection",
          "operand" => {
            "type" => "table",
            "name" => "super_blog_posts"
          },
          "predicate" => {
            "type" => "eq",
            "left_operand" => {
              "type" => "column",
              "table" => "super_blog_posts",
              "name" => "user_id"
            },
            "right_operand" => {
              "type" => "scalar",
              "value" => "jan"
            }
          }
        }

        dataset = exposed_repository.fetch([super_blog_posts_relation_representation])
        expected_records = exposed_repository.resolve_table_name(:super_blog_posts).where(Blog[:user_id].eq('jan')).records
        expected_records.should_not be_empty

        expected_records.each do |record|
          dataset['super_blog_posts'][record.id].should == record.wire_representation
        end
      end
    end
  end
end
