require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Monarch
  module Model
    module Tuples
      describe Record do
        describe "when a subclass in created" do
          it "assigns its .table to a new Table with the underscored-pluralized name of the class as its #global_name" do
            BlogPost.table.global_name.should == :blog_posts
          end

          it "adds its assigned .table to Repository #tables_by_name" do
            Repository.tables_by_name[:blog_posts].should == BlogPost.table
            Repository.tables_by_name[:blog_posts].tuple_class.should == BlogPost
          end

          it "defines an :id ConcreteColumn on the subclass" do
            BlogPost[:id].class.should == Expressions::ConcreteColumn
            BlogPost[:id].name.should == :id
            BlogPost[:id].type.should == :key
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

            context "if the column type is :boolean" do
              it "also defines a predicate ending in '?' that maps to #get_field_value for the field" do
                record = BlogPost.new
                mock.proxy(record).get_field_value(BlogPost[:featured]) { true }
                record.featured?.should be_true
              end
            end
          end

          describe ".synthetic_column" do
            attr_reader :record
            before do
              @record = User.find('jan')
            end

            it "defines a reader method for the synthetic field" do
              record.field(:great_name).value
              record.great_name
            end

            it "includes the value of a reader method by the same name in a record's #wire_representation" do
              record.wire_representation["great_name"].should == record.great_name
            end

            it "allows a writer method by the same name to be written to in a call to #update_fields" do
              record.field(:great_name).value = "Hunan"
              record.full_name.should == "Hunan The Great"
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

              new_blog = Blog.create!
              post = new_blog.blog_posts.create!(:body => "New post")
              new_blog.blog_posts.all.should == [post]
            end
          end

          describe ".belongs_to" do
            it "defines a Selection via .relates_to_one based on the given name, and also defines a writer method" do
              blog_post = BlogPost.find("grain_quinoa")
              blog_post.blog.should == Blog.find("grain")
              blog_post.blog = Blog.find("vegetable")
              blog_post.blog.should == Blog.find("vegetable")
            end

            context "when a :class_name option is passed" do
              it "uses the given class as the target of the foreign key rather than inferring it from the name of the foreign key" do
                # make blog actually point at a user, for the sake of testing
                BlogPost.belongs_to "blog", :class_name => "User"
                post = BlogPost.find("grain_quinoa")
                post.blog_id = "nathan"
                post.blog.should == User.find("nathan")
              end
            end
          end

          describe ".[]" do
            context "when the given value is the name of a ConcreteColumn defined on .table" do
              it "returns the ConcreteColumn with the given name" do
                BlogPost[:body].should == BlogPost.table.concrete_columns_by_name[:body]
              end
            end

            context "when the given value is not the name of a ConcreteColumn defined on .table" do
              it "raises an exception" do
                lambda do
                  BlogPost[:nonexistant_column]
                end.should raise_error
              end
            end
          end

          describe ".create!" do
            it "deletages to .table" do
              columns = { :body => "Amaranth" }
              mock(BlogPost.table).create!(columns)
              BlogPost.create!(columns)
            end
          end

          describe ".unsafe_new" do
            it "instantiates a Record with the given field values without overriding the value of :id" do
              record = BlogPost.unsafe_new(:id => "foo", :body => "Rice")
              record.id.should == "foo".hash
              record.body.should == "Rice"
            end
          end

          describe ".each" do
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
            @record ||= BlogPost.create!(:body => "Quinoa", :blog_id => "grain", :created_at => 1254162750000)
          end

          describe "#initialize" do
            it "assigns the ConcreteField values in the given hash" do
              record.get_field_value(BlogPost[:body]).should == "Quinoa"
              record.get_field_value(BlogPost[:blog_id]).should == "grain".hash
            end

            it "assigns #id to the auto-generated id" do
              record.id.should_not be_nil
            end

            it "assigns a field to its column's declared default if no value is assigned" do
              record = BlogPost.create!(:blog_id => "grain", :created_at => 1254162750000)
              record.body.should == BlogPost[:body].default_value
            end
          end

          describe "#snapshot" do
            it "returns a read-only copy of the record" do
              record = User.find('jan')
              snapshot = record.snapshot

              full_name_before = record.full_name
              great_name_before = record.great_name
              snapshot.full_name.should == full_name_before
              snapshot.great_name.should == great_name_before

              record.full_name = "Sharon Ly"
              snapshot.full_name.should == full_name_before
              snapshot.great_name.should == great_name_before

              lambda do
                snapshot.full_name = "Monkeyshine"
              end.should raise_error

              lambda do
                snapshot.great_name = "Monkeyshine"
              end.should raise_error
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

          describe "#destroy" do
            it "removes the record in the database and removes it from the thread-local and global identity maps and calls after_destroy hook" do
              mock(record).after_destroy
              record.activate
              BlogPost.table.local_identity_map[record.id].should == record
              BlogPost.table.global_identity_map[record.id].should == record

              record.destroy

              BlogPost.table.local_identity_map.should_not have_key(record.id)
              BlogPost.table.global_identity_map.should_not have_key(record.id)
              BlogPost.find(record.id).should be_nil
            end
          end

          describe "#field(column_or_name)" do
            def record
              @record ||= User.find('jan')
            end

            it "can return concrete or synthetic fields" do
              record.field(:full_name).should be_an_instance_of(ConcreteField)
              record.field(User[:full_name]).should be_an_instance_of(ConcreteField)
              record.field(:great_name).should be_an_instance_of(SyntheticField)
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
            def record
              @record ||= User.find('jan')
            end

            it "calls those assignment methods that actually exist by name and returns a hash of any fields that the update changed" do
              def record.fancy_full_name=(full_name)
                self.full_name = "Fancy " + full_name
              end

              age_before_update = record.age

              dirty_field_values = record.update(:has_hair => false, :fancy_full_name => "Nash Lincoln", :age => age_before_update, :bogus => "crap")

              record.full_name.should == "Fancy Nash Lincoln"
              record.has_hair.should == false
              record.age.should == age_before_update

              dirty_field_values.should == {:has_hair => false, :full_name => "Fancy Nash Lincoln", :great_name => "Fancy Nash Lincoln The Great"}
            end
          end

          describe "#update!(values_by_method_name)" do
            it "raises an exception if the record becomes invalid" do
              record = User.find('jan')

              lambda do
                record.update!(:age => 2)
              end.should raise_error(Monarch::Model::InvalidRecordException)

              record.update!(:age => 300)
              record.age.should == 300
            end
          end

          describe "#update_fields(field_values_by_column_name)" do
            def record
              @record ||= User.find('jan')
            end

            it "writes directly to fields, bypassing any custom writer methods, and returns the fields that were made dirty" do
              def record.some_method=(value)
                raise "Should not be called"
              end

              age_before_update = record.age

              dirty_field_values = record.update_fields(:has_hair => false, :full_name => "Nash Lincoln", :age => age_before_update, :some_method => "crap", :bogus => "crap")

              record.full_name.should == "Nash Lincoln"
              record.has_hair.should == false
              record.age.should == age_before_update

              dirty_field_values.should == {:has_hair => false, :full_name => "Nash Lincoln", :great_name => "Nash Lincoln The Great"}
            end
          end

          describe "#save" do
            context "when the record has not been persisted" do
              it "inserts the record, triggering before_create and after_create callbacks as well as triggering on_insert events" do
                record = BlogPost.new(:body => "Quinoa", :blog_id => "grain", :created_at => 1254162750000)
                mock(record).before_create
                mock(record).after_create

                inserted = nil
                BlogPost.on_insert {|r| inserted = r }

                record.should_not be_persisted
                record.save
                record.id.should_not be_nil
                record.should be_persisted
                inserted.should == record
              end
            end

            context "when the record has already been persisted" do
              it "calls Origin.update with the #global_name of the Record's #table and its #field_values_by_column_name" do
                record.title = "Queso"
                mock(Origin).update(record.table, record.id, record.dirty_concrete_field_values_by_column_name)
                record.save
              end

              it "calls #after_update if it is defined on the record with the dirty fields" do
                def record.after_update; end
                mock(record).after_update(is_a(Monarch::Model::Changeset)) do |changeset|
                  changeset.wire_representation.should == {"title" => "Queso"}
                end
                record.title = "Queso"
                record.save
              end

              it "triggers #on_update callbacks on the record's table with the record and a changeset" do
                on_update_calls = []
                User.table.on_update do |record, changeset|
                  on_update_calls.push([record, changeset])
                end

                record = User.find('jan')
                full_name_before = record.full_name
                great_name_before = record.great_name

                record.full_name = "Sharon Ly"
                record.save

                on_update_calls.length.should == 1
                on_update_record = on_update_calls.first[0]
                on_update_changeset = on_update_calls.first[1]

                on_update_record.should == record

                on_update_changeset.old_state.evaluate(User[:full_name]).should == full_name_before
                on_update_changeset.old_state.evaluate(User[:great_name]).should == great_name_before
                on_update_changeset.new_state.evaluate(User[:full_name]).should == record.full_name
                on_update_changeset.new_state.evaluate(User[:great_name]).should == record.great_name
              end
            end
          end

          describe "#valid?" do
            it "calls #before_validate before calling validate" do
              mock(record).before_validate.ordered
              mock(record).validate.ordered

              record.title = "Hola!"
              record.should_not be_validated
              record.valid?
            end

            describe "when #validate stores validation errors on at least one field" do
              it "returns false" do
                record.title = "Has Many Through"
                mock(record).validate do
                  record.field(:title).validation_errors.push("Title must not be lame")
                end
                record.should_not be_valid
              end
            end

            describe "when #validates stores no validation errors on any fields" do
              it "returns true" do
                record.should be_valid
              end
            end
          end

          describe "#validation_error" do
            it "pushes the given validation error message onto the field with the given name" do
              record.validation_error(:title, "Title must not be lame")
              record.field(:title).validation_errors.should == ["Title must not be lame"]
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
                record.should_not be_validated
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
                record.should_not be_validated
              end
            end
          end

          describe "#field_values_by_column_name" do
            it "returns a hash with the values of all fields indexed by ConcreteColumn name" do
              publicize record, :concrete_fields_by_column
              expected_hash = {}
              record.concrete_fields_by_column.each do |column, field|
                expected_hash[column.name] = field.value
              end

              record.field_values_by_column_name.should == expected_hash
            end
          end

          describe "#set_field_value and #get_field_value" do
            specify "set and get a ConcreteField value by ConcreteColumn or ConcreteColumn name" do
              record = BlogPost.new
              record.set_field_value(BlogPost[:body], "Quinoa")
              record.get_field_value(BlogPost[:body]).should == "Quinoa"

              record.set_field_value(:body, "Amaranth")
              record.get_field_value(:body).should == "Amaranth"
            end
          end
        end
      end
    end
  end
end
