require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Model
  describe Record do
    describe "when a subclass in created" do
      it "assigns its .table to a new Table with the underscored-pluralized name of the class as its #global_name" do
        BlogPost.table.global_name.should == :blog_posts
      end

      it "adds its assigned .table to Repository #tables_by_name" do
        Repository.tables_by_name[:blog_posts].should == BlogPost.table
        Repository.tables_by_name[:blog_posts].tuple_class.should == BlogPost
      end

      it "defines an :id Column on the subclass" do
        BlogPost[:id].class.should == Column
        BlogPost[:id].name.should == :id
        BlogPost[:id].type.should == :string
      end
    end

    describe "class methods" do
      describe ".column" do
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
          blog_posts_relation.all.should_not be_empty
          blog_posts_relation.all.each do |answer|
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
        specify "are forwarded to #all of #table" do
          all = []
          stub(BlogPost.table).all { all }

          block = lambda {}
          mock(all).each(&block)
          BlogPost.each(&block)
        end
      end
    end

    describe "instance methods" do
      def record
        @record ||= BlogPost.create(:body => "Quinoa", :blog_id => "grain", :created_at => 1254162750000)
      end

      describe "#initialize" do
        it "assigns the Field values in the given hash" do
          record.get_field_value(BlogPost[:body]).should == "Quinoa"
          record.get_field_value(BlogPost[:blog_id]).should == "grain"
        end

        it "assigns #id to a new guid" do
          record.id.should_not be_nil
        end

        it "assigns a field to its column's declared default if no value is assigned" do
          record = BlogPost.create(:blog_id => "grain", :created_at => 1254162750000)
          record.body.should == BlogPost[:body].default_value
        end
      end

      describe "#reload" do
        it "reloads field values from the database, bypassing any custom setter methods" do
          def record.body=(body)
            self.set_field_value(:body, "EVIL " + body)
          end

          original_body = record.body
          record.body = "Something else"
          record.body.should == "EVIL Something else"
          record.reload
          record.body.should == original_body
        end
      end

      describe "#wire_representation" do
        it "returns the values of all fields by string-valued column names, and converts :datetime fields to milliseconds since the epoch" do
          wire_representation = record.wire_representation
          wire_representation['id'].should == record.id
          wire_representation['body'].should == record.body
          wire_representation['blog_id'].should == record.blog_id
          wire_representation['created_at'].should == record.created_at.to_millis

          record.created_at = nil
          record.wire_representation['created_at'].should == nil
        end
      end

      describe "#update(values_by_method_name)" do
        it "calls those assignment methods that actually exist by name and returns a hash of any fields that the update changed" do
          def record.fancy_title=(title)
            self.title = "Fancy " + title
          end

          blog_id_before_update = record.blog_id

          dirty_field_values = record.update(:body => "Moo", :fancy_title => "Cows", :blog_id => blog_id_before_update, :bogus => "crap")

          record.body.should == "Moo"
          record.title.should == "Fancy Cows"
          record.blog_id.should == blog_id_before_update

          dirty_field_values.should == { :body => "Moo", :title => "Fancy Cows" }
        end
      end

      describe "#update_fields(field_values_by_column_name)" do
        it "writes directly to fields, bypassing any custom writer methods, and returns the fields that were made dirty" do
          def record.title=(title)
            self.title = "Fancy " + title
          end
          dirty_field_values = record.update_fields(:title => "Aspiration", :body => "I want to break free!", :blog_id => record.blog_id)
          record.title.should == "Aspiration"
          record.body.should == "I want to break free!"
          dirty_field_values.should == { :title => "Aspiration", :body => "I want to break free!" }
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
          publicize record, :fields_by_column
          expected_hash = {}
          record.fields_by_column.each do |column, field|
            expected_hash[column.name] = field.value
          end

          record.field_values_by_column_name.should == expected_hash
        end
      end
      
      describe "#set_field_value and #get_field_value" do
        specify "set and get a Field value by Column or Column name" do
          record = BlogPost.new
          record.set_field_value(BlogPost[:body], "Quinoa")
          record.get_field_value(BlogPost[:body]).should == "Quinoa"

          record.set_field_value(:body, "Amaranth")
          record.get_field_value(:body).should == "Amaranth"
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
    end
  end
end
