require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Monarch
  module Model
    module Relations
      describe Table do
        include Monarch
        
        attr_reader :table
        before do
          @table = BlogPost.table
        end

        describe "#initialize" do
          it "automatically has an :id column" do
            table.concrete_columns_by_name[:id].type.should == :key
          end
        end

        describe "#define_concrete_column" do
          it "adds a ConcreteColumn with the given name and type and self as its #table to the #concrete_columns_by_name hash" do
            column = table.concrete_columns_by_name[:body]
            column.name.should == :body
            column.type.should == :string
          end
        end

        describe "#concrete_columns" do
          it "returns the #values of #concrete_columns_by_name" do
            table.concrete_columns.should == table.concrete_columns_by_name.values
          end
        end

        describe "#column" do
          describe "when passed a string or symbol" do
            it "returns the column with that name or nil if none exists" do
              BlogPost.table.column(:id).should == BlogPost[:id]
              BlogPost.table.column("id").should == BlogPost[:id]
              BlogPost.table.column("crapola").should be_nil
            end
          end

          describe "when passed a column" do
            it "returns the column if its table matches self and nil otherwise" do
              BlogPost.table.column(BlogPost[:id]).should == BlogPost[:id]
              BlogPost.table.column(Blog[:id]).should be_nil
            end
          end
        end

        describe "#insert" do
          it "calls Origin.insert with the Table and #field_values_by_column_name and stores the record in the thread-local identity map" do
            record = BlogPost.new(:body => "Brown Rice", :blog_id => "grain")
            mock(Origin).insert(anything, anything) do |the_table, field_values|
              the_table.should == table
              field_values[:body].should == "Brown Rice"
              field_values[:blog_id].should == "grain".hash
              1 # id returned by insert
            end
            table.insert(record)
            table.local_identity_map[record.id].should == record
          end
        end

        describe "#build" do
          it "instantiates an instance of #tuple_class with the given field values, without inserting it into the database" do
            record = table.build(:body => "Brown Rice", :blog_id => "grain")
            record.body.should == "Brown Rice"
            record.blog_id.should == "grain".to_key
            record.should_not be_persisted
          end
        end

        describe "#create" do
          it "instantiates an instance of #tuple_class with the given field values, #inserts it, sets its timestamps if the columns are present, and returns it in a non-dirty state with its id assigned" do
            now = Time.now
            Timecop.freeze(now)

            record = table.create!(:body => "Brown Rice", :blog_id => "grain")
            record.id.should_not be_nil
            table.find(:body => "Brown Rice").should == record
            record.body.should == "Brown Rice"
            record.created_at.to_i.should == now.to_i
            record.updated_at.to_i.should == now.to_i
            record.should be_valid
            record.should_not be_dirty
          end

          context "if the record has a #before_create hook" do
            it "calls the after inserting the record" do
              mock.instance_of(BlogPost).before_create
              table.create!(:body => "Couscous")
            end
          end

          context "if the record has an #after_create hook" do
            it "calls the after inserting the record" do
              mock.instance_of(BlogPost).after_create
              table.create!(:body => "Couscous")
            end
          end

          context "if the instantiated record is invalid" do
            it "does not insert it in the database and returns the invalid record" do
              field_values = { :full_name => "Invalid Bob", :age => 2 }
              User.new(field_values).should_not be_valid
              User.table.create(field_values)
              User.find(User[:full_name].eq("Invalid Bob")).should be_nil
            end
          end
        end

        describe "#create!" do
          it "raises if the record isn't valid" do
            lambda do
              record = User.create!(:age => 2)
            end.should raise_error(Model::InvalidRecordException)
            User.create!(:age => 20).should be_valid
          end
        end

        describe "#find_or_create(predicate)" do
          context "when a record matching the predicate exists in the table" do
            it "returns the matching record" do
              extant_record = User.find(User[:full_name].eq('Jan Nelson'))
              extant_record.should_not be_nil
              User.find_or_create(User[:full_name].eq('Jan Nelson')).should == extant_record
            end
          end

          context "when NO record matching the predicate exists in the table"do
            it "creates a record that matches the given predicate" do
              User.find(User[:full_name].eq('Nathan Sobo')).should be_nil
              new_record = User.find_or_create(User[:full_name].eq('Nathan Sobo'))
              new_record.full_name.should == 'Nathan Sobo'
            end
          end
        end

        describe "#all" do
          it "executes a select all SQL query against the database and returns Records corresponding to its results" do
            record_1_id = table.create!(:body => "Quinoa", :blog_id => "grain").id
            record_2_id = table.create!(:body => "White Rice", :blog_id => "grain").id
            record_3_id = table.create!(:body => "Pearled Barley", :blog_id => "grain").id

            mock.proxy(Origin).read(table)

            all = table.all

            retrieved_record_1 = all.find {|t| t.id == record_1_id }
            retrieved_record_1.body.should == "Quinoa"
            retrieved_record_1.blog_id.should == "grain".hash

            retrieved_record_2 = all.find {|t| t.id == record_2_id }
            retrieved_record_2.body.should == "White Rice"
            retrieved_record_2.blog_id.should == "grain".hash

            retrieved_record_3 = all.find {|t| t.id == record_3_id }
            retrieved_record_3.body.should == "Pearled Barley"
            retrieved_record_3.blog_id.should == "grain".hash
          end
        end

        describe "#to_sql" do
          it "returns a select statement for only the concrete_columns declared as Columns on the Table" do
            table.to_sql.should == ["select blog_posts.* from blog_posts", {}]
          end
        end

        describe "#initialize_identity_map" do
          after do
            # verify doubles before the global after clears the identity map, causing an unexpected invocation
            RR::verify_doubles
          end

          it "initializes a thread-local identity map" do
            mock(Thread.current)['blog_posts_identity_map'] = {};
            BlogPost.table.initialize_identity_map
          end
        end

        describe "#local_identity_map" do
          it "returns the thread-local identity map" do
            mock(Thread.current)['blog_posts_identity_map']
            BlogPost.table.local_identity_map
          end
        end

        describe "#clear_identity_map" do
          after do
            # verify doubles before the global after clears the identity map, causing an unexpected invocation
            RR::verify_doubles
          end

          it "assigns the thread-local identity map to nil" do
            mock(Thread.current)['blog_posts_identity_map'] = nil;
            BlogPost.table.clear_identity_map
          end
        end

        describe "event handling" do
          attr_reader :on_insert_calls, :on_update_calls, :on_remove_calls

          before do
            @on_insert_calls = []
            @on_update_calls = []
            @on_remove_calls = []

            table.on_insert do |record|
              on_insert_calls.push(record)
            end
            table.on_update do |record, changeset|
              on_update_calls.push([record, changeset])
            end
            table.on_remove do |record|
              on_remove_calls.push(record)
            end
          end

          describe "when a record is inserted into the table" do
            it "triggers #on_insert callbacks with the record" do
              record = BlogPost.create!({:name => "Moo"})

              on_insert_calls.should == [record]
              on_update_calls.should be_empty
              on_remove_calls.should be_empty
            end
          end

          describe "when a record in the table is updated" do
            it "triggers #on_update callbacks with the record and the changeset" do
              Timecop.freeze(Time.now)
              record = BlogPost.find('grain_quinoa')
              record.update(:body => "Actually quinoa is not REALLY a grain, it's a seed", :blog_id => "vegetable")

              on_insert_calls.should be_empty
              on_update_calls.length.should == 1

              on_update_record, on_update_changeset = on_update_calls.first
              on_update_record.should == record
              on_update_changeset.wire_representation.should == {"body" => "Actually quinoa is not REALLY a grain, it's a seed", "blog_id" => "vegetable".hash, "updated_at" => Time.now.to_millis}

              on_remove_calls.should be_empty
            end
          end

          describe "when a record is removed from the table" do
            it "triggers #on_remove callbacks with the record" do
              record = BlogPost.find('grain_quinoa')
              record.destroy
              on_insert_calls.should be_empty
              on_update_calls.should be_empty
              on_remove_calls.should == [record]
            end
          end
        end
      end
    end
  end
end
