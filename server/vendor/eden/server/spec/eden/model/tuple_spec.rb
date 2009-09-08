require File.expand_path("#{File.dirname(__FILE__)}/../../eden_spec_helper")

module Model
  describe Record do
    describe "when a subclass in created" do
      it "assigns its .table to a new Table with the underscored-pluralized name of the class as its #global_name" do
        BlogPost.table.global_name.should == :blog_posts
      end

      it "adds its assigned .table to Repository #tables_by_name" do
        Repository.tables_by_name[:blog_posts].should == BlogPost.table
        Repository.tables_by_name[:blog_posts].record_class.should == BlogPost
      end

      it "defines an :id Column on the subclass" do
        BlogPost[:id].class.should == Column
        BlogPost[:id].name.should == :id
        BlogPost[:id].type.should == :string
      end
    end

    describe "class methods" do
      describe ".column" do
        it "delegates column definition to .table" do
          mock(BlogPost.table).define_column(:foo, :string)
          BlogPost.column(:foo, :string)
        end

        it "defines named instance methods that call #set_field_value and #get_field_value" do
          record = BlogPost.new

          mock.proxy(record).set_field_value(BlogPost[:body], "Barley")
          record.body = "Barley"
          mock.proxy(record).get_field_value(BlogPost[:body])
          record.body.should  == "Barley"
        end
      end

      describe ".has_many" do
        it "defines a Selection via .relates_to_many based on the given name" do
          blog = Blog.find("grain")
          blog_posts_relation = blog.blog_posts
          blog_posts_relation.records.should_not be_empty
          blog_posts_relation.records.each do |answer|
            answer.blog_id.should == blog.id
          end
        end
      end

      describe ".belongs_to" do
        it "defines a Selection via .relates_to_one based on the given name" do
          blog_post = BlogPost.find("grain_quinoa")
          blog_post.blog.should == Blog.find("grain")
          blog_post.blog_id = "vegetable"
          blog_post.blog.should == Blog.find("vegetable")
        end
      end

      describe ".[]" do
        context "when the given value is the name of a Column defined on .table" do
          it "returns the Column with the given name" do
            BlogPost[:body].should == BlogPost.table.columns_by_name[:body]
          end
        end

        context "when the given value is not the name of a Column defined on .table" do
          it "raises an exception" do
            lambda do
              BlogPost[:nonexistant_column]
            end.should raise_error
          end
        end
      end

      describe ".create" do
        it "deletages to .table" do
          columns = { :body => "Amaranth" }
          mock(BlogPost.table).create(columns)
          BlogPost.create(columns)
        end
      end

      describe ".unsafe_new" do
        it "instantiates a Record with the given field values without overriding the value of :id" do
          record = BlogPost.unsafe_new(:id => "foo", :body => "Rice")
          record.id.should == "foo"
          record.body.should == "Rice"
        end
      end

      describe "#each" do
        specify "are forwarded to #records of #table" do
          records = []
          stub(BlogPost.table).records { records }

          block = lambda {}
          mock(records).each(&block)
          BlogPost.each(&block)
        end
      end
    end

    describe "instance methods" do
      def record
        @record ||= BlogPost.new(:body => "Quinoa", :blog_id => "grain")
      end

      describe "#initialize" do
        it "assigns #fields_by_column to a hash with a Field object for every column declared in the table" do
          BlogPost.table.columns.each do |column|
            field = record.fields_by_column[column]
            field.column.should == column
            field.record.should == record
          end
        end

        it "assigns the Field values in the given hash" do
          record.get_field_value(BlogPost[:body]).should == "Quinoa"
          record.get_field_value(BlogPost[:blog_id]).should == "grain"
        end

        it "assigns #id to a new guid" do
          record.id.should_not be_nil
        end
      end

      describe "#wire_representation" do
        it "returns #fields_by_column_name with string-valued keys" do
          record.wire_representation.should == record.field_values_by_column_name.stringify_keys
        end
      end

      describe "#save" do
        it "calls Origin.update with the #global_name of the Record's #table and its #field_values_by_column_name" do
          mock(Origin).update(record.table, record.field_values_by_column_name)
          record.save
        end
      end

      describe "#dirty?" do
        context "when a Record has been instantiated but not inserted into the RemoteRepository" do
          it "returns true" do
            record = BlogPost.new
            record.should be_dirty
          end
        end

        context "when a Record has been inserted into the RemoteRepository and not modified since" do
          it "returns false" do
            record = BlogPost.new(:blog_id => "grain", :body => "Bulgar Wheat")
            record.save
            record.should_not be_dirty
          end
        end

        context "when a Record has been inserted into the RemoteRepository and subsequently modified" do
          it "returns true" do
            record = BlogPost.new(:blog_id => "grain", :body => "Bulgar Wheat")
            record.save
            record.body = "Wheat"
            record.should be_dirty
          end
        end

        context "when a Record is first loaded from a RemoteRepository" do
          it "returns false" do
            record = BlogPost.find("grain_quinoa")
            record.should_not be_dirty
          end
        end

        context "when a Record has been modified since being loaded from the RemoteRepository" do
          it "returns true" do
            record = BlogPost.find("grain_quinoa")
            record.body = "Red Rice"
            record.should be_dirty
          end
        end
      end

      describe "#field_values_by_column_name" do
        it "returns a hash with the values of all fields indexed by Column name" do
          expected_hash = {}
          record.fields_by_column.each do |column, field|
            expected_hash[column.name] = field.value
          end

          record.field_values_by_column_name.should == expected_hash
        end
      end
      
      describe "#set_field_value and #get_field_value" do
        specify "set and get a Field value" do
          record = BlogPost.new
          record.set_field_value(BlogPost[:body], "Quinoa")
          record.get_field_value(BlogPost[:body]).should == "Quinoa"
        end
      end

      describe "#==" do
        context "for Records of the same class" do
          context "for Records with the same id" do
            it "returns true" do
              BlogPost.find("grain_quinoa").should == BlogPost.unsafe_new(:id => "grain_quinoa")
            end
          end

          context "for Records with different ids" do
            it "returns false" do
              BlogPost.find("grain_quinoa").should_not == BlogPost.unsafe_new(:id => "grain_barley")
            end
          end
        end

        context "for Records of different classes" do
          it "returns false" do
            BlogPost.find("grain_quinoa").should_not == Blog.unsafe_new(:id => "grain_quinoa")
          end
        end
      end

      describe "remote query functionality" do
        def record
          @record ||= User.find("nathan")
        end

        describe "#build_relation_from_wire_representation" do
          it "delegates to Relation#from_wire_representation with self as the subdomain" do
            representation = {
              "type" => "table",
              "name" => "blogs"
            }
            mock(Relations::Relation).from_wire_representation(representation, record)
            record.build_relation_from_wire_representation(representation)
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

            snapshot = record.fetch([blogs_relation_representation, blog_posts_relation_representation])

            blogs_snapshot_fragment = snapshot["blogs"]
            blogs_snapshot_fragment.size.should == 1
            blogs_snapshot_fragment["grain"].should == Blog.find("grain").wire_representation
          end
        end

        describe "#get" do
          it "parses the 'relations' paramater from a JSON string into an array of wire representations and performs a #fetch with it, returning the resulting snapshot as a JSON string" do
            relations = [{ "type" => "table", "name" => "blog_posts"}]

            snapshot = nil
            mock.proxy(Repository.instance).fetch(relations) {|result| snapshot = result}

            response = record.get({"relations" => relations.to_json})

            response[0].should == 200
            response[1].should == { 'Content-Type' => 'application/json'}
            JSON.parse(response[2]).should == Repository.instance.fetch(relations)
          end
        end
      end
    end
  end
end
