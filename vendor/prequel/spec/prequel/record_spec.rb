require 'spec_helper'

module Prequel
  describe Record do
    before do
      class ::Blog < Record
        column :id, :integer
        column :title, :string
      end
    end

    describe "when it is subclassed" do
      it "associates the subclass with a table" do
        Blog.table.name.should == :blogs
        Blog.table.tuple_class.should == Blog
      end

      it "defines accessor methods on the subclass for columns on the table" do
        b = Blog.new
        b.title = "Title"
        b.title.should == "Title"
      end

      it "for boolean columns, defines an additional predicate-style '?' method" do
        Blog.column :admin, :boolean
        b = Blog.new(:admin => true)
        b.admin?.should be_true
      end

      it "registers the subclass on the global record class array" do
        Prequel.record_classes.should == [::Blog]
      end
    end

    describe "class methods" do
      describe "relation macros" do
        before do
          class ::Post < Record
            column :id, :integer
            column :blog_id, :integer
          end
        end

        describe ".has_many(name)" do
          it "gives records a one-to-many relation to the table with the given name" do
            Blog.has_many(:posts)
            blog = Blog.new(:id => 1)
            blog.posts.should == Post.where(:blog_id => 1)
          end

          it "accepts a :class_name option" do
            Blog.has_many(:posts_with_another_name, :class_name => "Post")
            blog = Blog.new(:id => 1)
            blog.posts_with_another_name.should == Post.where(:blog_id => 1)
          end

          it "accepts an :order_by option" do
            Blog.has_many(:posts, :order_by => :id)
            blog = Blog.new(:id => 1)
            blog.posts.should == Post.where(:blog_id => 1).order_by(:id)

            Blog.has_many(:posts, :order_by => [:id, :blog_id.desc])
            blog.posts.should == Post.where(:blog_id => 1).order_by(:id, :blog_id.desc)
          end

          it "accepts a :foreign_key option" do
            Post.column :creator_id, :integer
            class ::User < Record
              column :id, :integer
            end

            User.has_many :posts, :foreign_key => :creator_id

            user = User.new(:id => 1)
            user.posts.should == Post.where(:creator_id => 1)
          end
        end

        describe ".belongs_to(name)" do
          before do
            Blog.create_table
            DB[:blogs] << {:id => 1}
            DB[:blogs] << {:id => 2}
          end

          it "gives records a reader method that finds the associated record" do
            Post.belongs_to(:blog)
            post = Post.new(:blog_id => 1)
            post.blog.should == Blog.find(1)

            post.blog_id = 99
            post.blog.should be_nil
          end

          it "gives record a writer method that assigns the foreign key based on a given record" do
            Post.belongs_to(:blog)
            post = Post.new
            post.blog = Blog.find(2)
            post.blog_id.should == 2
            post.blog = nil
            post.blog_id.should be_nil
          end

          it "accepts a class name option" do
            Post.column(:my_blog_id, :integer)
            Post.belongs_to(:my_blog, :class_name => "Blog")
            post = Post.new(:my_blog_id => 1)
            post.my_blog.should == Blog.find(1)
            post.my_blog = Blog.find(2)
            post.my_blog_id.should == 2
          end
        end
      end

      describe ".new(field_values)" do
        it "returns a record with the same id from the identity map if it exists" do
          Blog.create_table
          DB[:blogs] << {:id => 1, :title => "Blog 1"}

          blog = Blog.find(1)
          blog.id.should == 1
          Blog.find(1).should equal(blog)

          stub(Prequel).session { Session.new }

          Blog.find(1).should_not equal(blog)
        end

        it "does not attempt to store records with no id in the identity map" do
          Blog.new.should_not equal(Blog.new)
        end
      end

      describe ".secure_new(field_values)" do
        before do
          class ::Blog < Record
            column :subtitle, :string
            column :user_id, :integer

            def create_whitelist
              [:subtitle, :title, :user_id]
            end

            def create_blacklist
              [:user_id]
            end
          end

          Blog.create_table
        end

        it "only allows attributes that are on the create whitelist and not on the create blacklist to be assigned" do
          blog = Blog.secure_new(:title => "The Chefanies", :subtitle => "Exploring Deliciousness", :user_id => 4)
          blog.should_not be_persisted

          blog.title.should == "The Chefanies"
          blog.subtitle.should == "Exploring Deliciousness"
          blog.user_id.should be_nil
        end

        it "if can_create? returns false, and does not create the record and returns false" do
          class ::Blog
            def can_create?
              false
            end
          end

          Blog.secure_new(:title => "Hola!").should be_false
        end
      end

      describe ".create and .create!" do
        before do
          Blog.create_table
        end

        describe ".create(attributes)" do
          it "builds and saves an instance, sets its id, and ensures it is present in the session's identity map" do
            blog = Blog.create(:title => "My Blog!")
            blog.id.should_not be_nil
            blog.should equal(Blog.find(blog.id))
          end
        end

        describe ".create!(attributes)" do
          it "if the record is not valid, raises a Record::NotValid exception" do
            class ::Blog
              def valid?
                false
              end
            end

            expect {
              Blog.create!(:title => "My Blog!")
            }.to raise_error(Record::NotValid)
          end

          it "if the record is valid, creates it as normal" do
            blog = Blog.create!(:title => "My Blog!")
            blog.id.should_not be_nil
          end
        end
      end

      describe ".secure_create(attributes)" do
        before do
          class ::Blog < Record
            column :subtitle, :string
            column :user_id, :integer

            def create_whitelist
              [:subtitle, :title, :user_id]
            end

            def create_blacklist
              [:user_id]
            end
          end

          Blog.create_table
        end

        it "only allows attributes that are on the create whitelist and not on the create blacklist to be assigned" do
          blog = Blog.secure_create(:title => "The Chefanies", :subtitle => "Exploring Deliciousness", :user_id => 4)
          blog.id.should_not be_nil

          blog.title.should == "The Chefanies"
          blog.subtitle.should == "Exploring Deliciousness"
          blog.user_id.should be_nil
        end

        it "if can_create? returns false, and does not create the record and returns false" do
          class ::Blog
            def can_create?
              false
            end
          end

          expect {
            Blog.secure_create(:title => "Hola!").should be_false
          }.should_not change(Blog, :count)
        end
      end

      describe "on create/update/destroy methods" do
        attr_reader :create_events, :update_events, :destroy_events
        attr_reader :blog_1, :blog_2
        before do
          Blog.create_table
          @blog_1 = Blog.create(:title => "Blog 1")
          @blog_2 = Blog.create(:title => "Blog 2")

          @create_events = []
          @update_events = []
          @destroy_events = []

          Prequel.session.flush_deferred_events
          Blog.on_create {|blog| create_events << blog }
          Blog.on_update {|blog, changeset| update_events << [blog, changeset] }
          Blog.on_destroy {|blog| destroy_events << blog }
        end

        context "when mutations are performed inside of a transaction" do
          specify "if the transaction completes, events are flushed and fire callbacks" do
            new_blog = nil
            Prequel.transaction do
              new_blog = Blog.create!(:title => "New Blog")
              new_blog.update(:title => "New Blog Prime")
              blog_1.update(:title => "Blog 1 Prime")
              blog_1.destroy
              blog_2.destroy

              create_events.should be_empty
              update_events.should be_empty
              destroy_events.should be_empty
            end

            create_events.should == [new_blog]
            update_events.should == [
              [new_blog, {:title => { :old_value => "New Blog", :new_value => "New Blog Prime"}}],
              [blog_1, {:title => { :old_value => "Blog 1", :new_value => "Blog 1 Prime"}}]
            ]
            destroy_events.should == [blog_1, blog_2]
          end

          specify "if the transaction is aborted, the events are cleared and never fire callbacks" do
            Prequel.transaction do
              Blog.create!(:title => "New Blog")
              blog_1.update(:title => "Blog 1 Prime")
              blog_2.destroy

              create_events.should be_empty
              update_events.should be_empty
              destroy_events.should be_empty

              raise Prequel::Rollback
            end

            create_events.should be_empty
            update_events.should be_empty
            destroy_events.should be_empty

            new_blog = nil
            Prequel.transaction do
              new_blog = Blog.create!(:title => "New Blog")
              new_blog.update(:title => "New Blog Prime")
              blog_2.destroy
            end

            create_events.should == [new_blog]
            update_events.should == [[new_blog, {:title => {:old_value => "New Blog", :new_value => "New Blog Prime"}}]]
            destroy_events.should == [blog_2]
          end
        end

        context "when mutations are performed outside of a transaction" do
          specify "they trigger events immediately" do
            blog = Blog.create!(:title => "New Blog")
            create_events.should == [blog]
            blog.update(:title => "New Blog Prime")
            update_events.should == [[blog, {:title => {:old_value => "New Blog", :new_value => "New Blog Prime"}}]]
            blog.destroy
            destroy_events.should == [blog]
          end
        end

        context "when the class is reloaded" do
          it "continues to trigger events from subscriptions registered prior to the reload" do
            blog1 = Blog.create!(:title => "New Blog")
            blog1.update!(:title => "New Blog Prime")
            blog1.destroy

            create_events.should == [blog1]
            update_events.should == [[blog1, {:title => {:old_value => "New Blog", :new_value => "New Blog Prime"}}]]
            destroy_events.should == [blog1]


            create_events.clear
            update_events.clear
            destroy_events.clear

            Object.send(:remove_const, :Blog)

            class ::Blog < Record
              column :id, :integer
              column :title, :string
            end

            blog2 = Blog.create!(:title => "Another Blog")
            blog2.update!(:title => "Another Blog Prime")
            blog2.destroy

            create_events.should == [blog2]
            update_events.should == [[blog2, {:title => {:old_value => "Another Blog", :new_value => "Another Blog Prime"}}]]
            destroy_events.should == [blog2]
          end
        end
      end
    end

    describe "#initialize" do
      it "honors default values from the table's column declarations, if they aren't specified in the attributes" do
        Blog.column :title, :string, :default => "New Blog"
        Blog.new.title.should == "New Blog"
        Blog.new(:title => "My Blog").title.should == "My Blog"

        Blog.column :good, :boolean, :default => false
        Blog.new.good.should == false
      end
    end

    describe "#reload(columns = nil)" do
      attr_reader :blog

      before do
        class ::Blog < Record
          column :user_id, :integer
          column :subtitle, :string
        end
        Blog.create_table
        @blog = Blog.create(:title => "Title 1", :subtitle => "Subtitle 1", :user_id => 1)
      end

      context "when not passed any columns" do
        it "reloads the record and marks it clean" do
          blog.soft_update(:title => "Dirty Title", :subtitle => "Dirty Subtitle", :user_id => 99)
          blog.should be_dirty

          blog.reload

          blog.should be_clean
          blog.title.should == "Title 1"
          blog.subtitle.should == "Subtitle 1"
          blog.user_id.should == 1

          DB[:blogs].update(:title => "Title 2", :subtitle => "Subtitle 2", :user_id => 100)
          blog.reload

          blog.should be_clean
          blog.title.should == "Title 2"
          blog.subtitle.should == "Subtitle 2"
          blog.user_id.should == 100
        end
      end

      context "when passed columns" do
        it "reloads only the given columns and marks them clean" do
          blog.soft_update(:title => "Dirty Title", :subtitle => "Dirty Subtitle", :user_id => 99)
          blog.should be_dirty

          blog.reload(:title, :subtitle)

          blog.dirty_field_values.keys.should == [:user_id]
          blog.title.should == "Title 1"
          blog.subtitle.should == "Subtitle 1"
          blog.user_id.should == 99
        end
      end
    end

    describe "#save and #save!" do
      attr_reader :blog

      before do
        Blog.column :user_id, :integer
        Blog.column :created_at, :datetime
        Blog.column :updated_at, :datetime
        Blog.create_table
        @blog = Blog.new({:title => "Unsaved Blog", :user_id => 1})
        blog.id.should be_nil
      end

      describe "#save" do
        describe "when the record has not yet been inserted into the database" do
          it "inserts the record, sets its id, and ensures it is present in the session's identity map" do
            blog.save
            blog.id.should_not be_nil
            DB[:blogs].filter(:id => blog.id).first.should == blog.field_values
            blog.should equal(Blog.find(blog.id))
          end

          it "executes before_create and after_create hooks at the appropriate moments" do
            mock(blog).before_create do
              blog.should_not be_persisted
              blog.should_not be_clean
              Prequel.session.transaction_depth.should == 1
              blog.id.should be_nil
            end
            mock(blog).after_create do
              blog.should be_persisted
              blog.should be_clean
              Prequel.session.transaction_depth.should == 1
              blog.id.should_not be_nil
            end
            blog.save
          end

          it "executes before_save and after_save hooks at the appropriate moments" do
            mock(blog).before_save do
              Prequel.session.transaction_depth.should == 1
              blog.id.should be_nil
            end
            mock(blog).after_save do
              Prequel.session.transaction_depth.should == 1
              blog.id.should_not be_nil
            end
            blog.save
          end

          it "if the record is invalid, returns false and does not insert it" do
            stub(blog).valid? { false }
            expect {
              blog.save.should == false
            }.to_not change(Blog, :count)
          end

          it "assigns the current time to created_at and updated_at fields if they are present" do
            freeze_time
            blog.save
            blog.created_at.should == Time.now
            blog.updated_at.should == Time.now
          end
        end

        describe "when the record has already been inserted into the database" do
          before do
            freeze_time
            blog.save
            blog.id.should_not be_nil
          end

          it "saves only the fields that are dirty back into the database" do
            blog.title = "New Title"
            DB[:blogs].filter(:id => blog.id).update(:user_id => 2)
            blog.user_id.should == 1

            blog.save

            DB[:blogs].count.should == 1
            fields = DB[:blogs].filter(:id => blog.id).first

            fields[:id].should == blog.id
            fields[:title].should == "New Title"
            fields[:user_id].should == 2
          end

          it "executes before_update and after_update hooks with a changeset" do
            old_title = blog.title
            old_user_id = blog.user_id
            old_updated_at = blog.updated_at
            jump 1.minute

            initial_changeset = Changeset.new(blog)
            initial_changeset.changed(:title, old_title, "New Title")
            initial_changeset.changed(:user_id, old_user_id, 99)

            final_changeset = Changeset.new(blog)
            final_changeset.changed(:title, old_title, "New Title")
            final_changeset.changed(:user_id, old_user_id, 99)
            final_changeset.changed(:updated_at, old_updated_at, Time.now)

            mock(blog).before_update(initial_changeset) do
              blog.should be_dirty
              Prequel.session.transaction_depth.should == 1
            end
            mock(blog).after_update(final_changeset) do
              blog.should be_clean
              Prequel.session.transaction_depth.should == 1
            end

            blog.title = "New Title"
            blog.user_id = 99
            blog.save

            changeset = Changeset.new(blog)
            changeset.changed(:title, "New Title", "Newer Title")
            changeset.changed(:user_id, 99, 100)

            mock(blog).before_update(changeset)
            mock(blog).after_update(changeset)

            blog.title = "Newer Title"
            blog.user_id = 100
            blog.save
          end

          it "executes #after_update hook and #on_update callbacks with a changeset that includes additional changes made in the #before_update/save hooks" do
            jump 1.minute

            old_title = blog.title
            old_user_id = blog.user_id
            old_user_updated_at = blog.updated_at

            changeset1 = Changeset.new(blog)
            changeset1.changed(:title, old_title, "New Title")

            changeset2 = Changeset.new(blog)
            changeset2.changed(:title, old_title, "New Title")
            changeset2.changed(:user_id, old_user_id, 99)
            changeset2.changed(:updated_at, old_user_updated_at, Time.now)

            mock(blog).before_update(changeset1) { blog.user_id = 99 }
            mock(blog).after_update(changeset2)

            events = []
            Blog.on_update do |blog, changeset|
              events.push([blog, changeset])
            end

            blog.title = "New Title"
            blog.save

            events.should == [[blog, changeset2]]
          end

          it "executes before_save and after_save hooks" do
            mock(blog).before_save do
              blog.should be_dirty
              Prequel.session.transaction_depth.should == 1
            end
            mock(blog).after_save do
              blog.should be_clean
              Prequel.session.transaction_depth.should == 1
            end

            blog.title = "New Title"
            blog.save
          end

          it "if the record is invalid, returns false and does not update it" do
            old_title = blog.title
            blog.title = "New Title"
            mock(blog).valid? { false }
            blog.save.should be_false
            blog.reload.title.should == old_title
          end

          it "if the record is clean (has no dirty fields), executes before hooks but does not update the database or change updated_at unless the before hooks make it dirty" do
            jump 1.minute

            mock(blog) do |blog|
              blog.before_update({})
              blog.before_save
            end

            dont_allow(blog) do |blog|
              blog.after_update
              blog.after_save
            end
            
            blog.should be_clean
            blog.save.should be_true
            blog.updated_at.should == 1.minute.ago
          end

          it "does not blow up if there are no dirty fields" do
            blog.save
          end

          it "assigns the current time to the updated_at field if it is present" do
            jump(1.minute)

            blog.title = "New Title"
            blog.save

            blog.created_at.to_s.should == 1.minute.ago.to_s
            blog.updated_at.should == Time.now
          end
        end
      end

      describe "#save!" do
        it "raises a Record::NotValid if the record is invalid" do
          mock(blog).valid? { false }
          expect {
            blog.save!
          }.to raise_error(Record::NotValid)
        end

        it "saves the record as normal if it is valid" do
          blog.title = "New Title"
          blog.save!
          blog.reload.title.should == "New Title"
        end
      end
    end

    describe "#increment and #decrement" do
      attr_reader :blog
      let(:update_events) { [] }

      before do
        class ::Blog
          column :times_read, :integer

          create_table
        end

        @blog = Blog.create(:times_read => 5)

        Blog.on_update {|blog, changeset| update_events << [blog, changeset] }
      end

      describe "#increment(field_name, count=1)" do
        it "atomically increments the given field name by the given amount and triggers an update event" do
          DB[:blogs].filter(:id => blog.id).update(:times_read => 7)
          blog.increment(:times_read, 2)
          blog.times_read.should == 9
          blog.reload.times_read.should == 9

          update_events.length.should == 1
          event = update_events.first
          event[0].should == blog
          event[1].new(:times_read).should == 9
          event[1].old(:times_read).should == 7
        end
      end

      describe "#decrement(field_name)" do
        it "atomically decrements the given field name by the given amount" do
          DB[:blogs].filter(:id => blog.id).update(:times_read => 3)
          blog.decrement(:times_read, 2)
          blog.times_read.should == 1
          blog.reload.times_read.should == 1

          update_events.length.should == 1
          event = update_events.first
          event[0].should == blog
          event[1].new(:times_read).should == 1
          event[1].old(:times_read).should == 3
        end
      end
    end

    describe "#valid?" do
      it "calls validation hooks and the validate method, and returns false if there were any errors" do
        class ::Blog
          def validate
            errors.add(:title, "Not a good name!")
          end
        end

        blog = Blog.new
        blog.should_not be_valid

        class ::Blog
          def validate
          end
        end
        blog.should be_valid


        Blog.validate do
          errors.add(:title, "Not a nice name!")
        end

        blog.should_not be_valid
      end
    end

    describe "standard validations" do
      describe ".validates_uniqueness_of" do
        it "ensures that the specified field is unique" do
          Blog.create_table
          Blog.validates_uniqueness_of :title, :message => "Title is duplicated!"
          blog = Blog.create!(:title => "foo")
          blog.should be_valid

          blog2 = Blog.new(:title => "foo")
          blog2.should_not be_valid
          blog2.errors.should == { :title => ["Title is duplicated!"] }
          Blog.new(:title => "bar").should be_valid
        end

        it "raises an exception if the column doesn't exist" do
          expect do
            Blog.validates_uniqueness_of :foo
          end.to raise_error
        end
      end

      describe ".validates_presence_of" do
        it "ensures the specified field is present" do
          Blog.validates_presence_of :title

          Blog.new(:title => "").should_not be_valid
          Blog.new.should_not be_valid
          Blog.new(:title => "foo").should be_valid
        end

        it "raises an exception if the column doesn't exist" do
          expect do
            Blog.validates_presence_of :foo
          end.to raise_error
        end
      end
    end

    describe "#update(!) and #secure_update" do
      attr_reader :blog
      before do
        class ::Blog
          column :user_id, :integer
          column :subtitle, :string
          synthetic_column :tricky_subtitle, :string

          def tricky_subtitle=(subtitle)
            self.subtitle = "Tricky #{subtitle}"
          end

          create_table
        end
        @blog = Blog.create({:title => "Saved Blog", :user_id => 1})
      end

      describe "#set_field_value" do
        attr_reader :post
        before do
          class ::Post < Prequel::Record
            column :id, :integer
            column :integer_field, :integer
            column :float_field, :float
            column :datetime_field, :datetime
            column :boolean_field, :boolean
            synthetic_column :datetime_synthetic_field, :datetime

            attr_accessor :datetime_synthetic_field

            create_table
          end
          @post = Post.create!
        end

        it "converts epoch milleseconds to times whether they are integers or strings" do
          freeze_time

          # regular field, integer
          post.set_field_value(:datetime_field, Time.now.to_millis)
          post.datetime_field.should be_a(Time)
          post.datetime_field.to_i.should == Time.now.to_i

          # regular field, string
          post.set_field_value(:datetime_field, Time.now.to_millis.to_s)
          post.datetime_field.should be_a(Time)
          post.datetime_field.to_i.should == Time.now.to_i

          # synthetic field, integer
          post.set_field_value(:datetime_synthetic_field, Time.now.to_millis)
          post.datetime_synthetic_field.should be_a(Time)
          post.datetime_synthetic_field.to_i.should == Time.now.to_i

          # synthetic field, string
          post.set_field_value(:datetime_synthetic_field, Time.now.to_millis.to_s)
          post.datetime_synthetic_field.should be_a(Time)
          post.datetime_synthetic_field.to_i.should == Time.now.to_i
        end

        it "converts strings to integers" do
          post.set_field_value(:integer_field, '-11')
          post.integer_field.should == -11
        end

        it "converts strings to floats" do
          post.set_field_value(:float_field, '-11.5')
          post.float_field.should == -11.5
        end

        it "converts strings to booleans" do
          post.set_field_value(:boolean_field, 'true')
          post.boolean_field.should be_true

          post.set_field_value(:boolean_field, 'false')
          post.boolean_field.should be_false
          
          post.set_field_value(:boolean_field, '1')
          post.boolean_field.should be_true

          post.set_field_value(:boolean_field, '0')
          post.boolean_field.should be_false

          post.set_field_value(:boolean_field, 1)
          post.boolean_field.should be_true

          post.set_field_value(:boolean_field, 0)
          post.boolean_field.should be_false

          post.set_field_value(:boolean_field, nil)
          post.boolean_field.should be_nil

        end
      end

      describe "#update(attributes)" do
        it "assigns all fields and synthetic fields and saves the record" do
          blog.update(:title => "Coding For Fun", :tricky_subtitle => "And Maybe Eventually Profit?", :user_id => 4)

          DB[:blogs].find(blog.id).first.should == {
            :id => blog.id,
            :title => "Coding For Fun",
            :subtitle => "Tricky And Maybe Eventually Profit?",
            :user_id => 4
          }
        end

        it "will assign to writer methods if no field or synthetic field is defined" do
          class ::Blog
            attr_accessor :normal_attribute
          end

          blog.update(:normal_attribute => "foo")
          blog.normal_attribute.should == 'foo'
        end

        describe "assigning a record corresponding to a foreign key" do
          attr_reader :post
          before do
            class ::Post < Prequel::Record
              column :id, :integer
              column :blog_id, :integer

              create_table
            end

            @post = Post.create!
          end

          it "assigns the foreign key based on the given model" do
            blog = Blog.create!
            post.update(:blog => blog)
            post.blog_id.should == blog.id

            post.update(:blog => nil)
            post.blog_id.should be_nil
          end
        end
      end

      describe "#update!(attributes)" do
        it "if the update causes the record to not be valid, raises a Record::NotValid exception" do
          mock(blog).valid? { false }

          old_title = blog.title
          expect {
            blog.update!(:title => "Coding For Fun", :user_id => 4)
          }.to raise_error(Record::NotValid)
          blog.reload.title.should == old_title
        end

        it "if the record is valid, updates it as normal" do
          blog.update!(:title => "Coding For Fun")
          blog.title.should == "Coding For Fun"
        end
      end

      describe "#secure_update(attributes)" do
        it "only allows whitelisted attributes to be assigned" do
          stub(blog).update_whitelist { [:title, :subtitle] }
          stub(blog).update_blacklist { [:title] }

          blog.secure_update(:title => "Coding For Fun", :subtitle => "And Maybe Eventually Profit?", :user_id => 4)
          DB[:blogs].find(blog.id).first.should == {
            :id => blog.id,
            :title => "Saved Blog",
            :subtitle => "And Maybe Eventually Profit?",
            :user_id => 1
          }
        end

        it "if can_update? returns false does not perform the update and returns false" do
          stub(blog).can_update? { false }
          blog.secure_update(:title => "Coding For Fun", :subtitle => "And Maybe Eventually Profit?").should be_false
          DB[:blogs].find(blog.id).first.should == {
            :id => blog.id,
            :title => "Saved Blog",
            :subtitle => nil,
            :user_id => 1
          }
          

          stub(blog).can_update? { true }
        end
      end
    end

    describe "#destroy and #secure_destroy" do
      attr_reader :blog
      before do
        Blog.create_table
        @blog = Blog.create
      end

      describe "#destroy" do
        it "removes the record from the database and the identity map" do
          blog.destroy
          Blog.find(blog.id).should be_nil
          Prequel.session[:blogs][blog.id].should be_nil
        end

        it "executes before_destroy and after_destroy destroy hooks at the appropriate moment" do
          mock(blog).before_destroy do
            Prequel.session.transaction_depth.should == 1
            Blog.find(blog.id).should be
          end
          mock(blog).after_destroy do
            Prequel.session.transaction_depth.should == 1
            Blog.find(blog.id).should be_nil
          end

          blog.destroy
        end
      end

      describe "#secure_destroy" do
        it "if can_destroy? returns false, returns false and does not destroy the record" do
          stub(blog).can_destroy? { false }
          blog.secure_destroy
          Blog.find(blog.id).should == blog
          Prequel.session[:blogs][blog.id].should == blog
        end
      end
    end

    describe "methods that return field values" do
      before do
        class ::Blog
          Blog.synthetic_column :lucky_number, :integer

          def lucky_number
            7
          end
        end
      end

      describe "#field_values" do
        it "returns only real field values as a hash" do
          blog = Blog.new(:title => "My Blog")
          blog.field_values.should == {
            :id => nil,
            :title => "My Blog"
          }
        end
      end

      describe "#wire_representation" do
        it "returns all field values (including synthetic) that are on the #read_whitelist and not on the black list, with stringified keys" do
          blog = Blog.new(:title => "My Blog")
          blog.wire_representation.should == {
            'id' => nil,
            'lucky_number' => 7,
            'title' => "My Blog"
          }

          stub(blog).read_whitelist { [:id, :lucky_number] }
          blog.wire_representation.should == {
            'id' => nil,
            'lucky_number' => 7,
          }

          stub(blog).read_blacklist { [:lucky_number] }
          blog.wire_representation.should == {
            'id' => nil
          }
        end

        it "converts all datetime fields (including synthetic) to epoch milliseconds" do
          freeze_time

          Blog.column(:created_at, :datetime)
          blog = Blog.new
          blog.created_at = Time.now
          blog.wire_representation['created_at'].should == Time.now.to_millis
        end
      end
    end

    describe "unpersisted vs. persisted state" do
      before do
        Blog.create_table
      end

      specify "a record is unpersisted before it is saved in the database and persisted thereafter" do
        blog = Blog.new(:title => "Hello there")
        blog.should be_unpersisted
        blog.save
        blog.should be_persisted

        DB[:blogs] << { :id => 2 }
        Blog.find(2).should be_persisted
      end
    end

    describe "clean vs. dirty state" do
      before do
        Blog.create_table
      end

      specify "a record is dirty before it has been saved for the first time and clean thereafter" do
        blog = Blog.new(:title => "Hello there")
        blog.should be_dirty
        blog.save
        blog.should be_clean
      end

      specify "a record is clean when it is freshly retrieved from the database, dirty after local modifications, and clean again after being saved" do
        DB[:blogs] << {:id => 1, :title => "Hi!"}
        DB[:blogs] << {:id => 2, :title => "Ho!"}
        blog = Blog.find(1)
        blog.should be_clean

        Blog.all.each do |blog|
          blog.should be_clean
        end

        blog.title = "Bye!"
        blog.should be_dirty
        blog.save
        blog.should be_clean
      end

      specify "a record that has not been saved is dirty, even if no attributes have been assigned" do
        Blog.new.should be_dirty
      end
    end

    describe "persisted vs. unpersisted state" do
      before do
        Blog.create_table
      end

      specify "a record is unpersisted before it has been saved for the first time, then persisted once it's been saved" do
        blog = Blog.new
        blog.should be_unpersisted
        blog.save
        blog.should be_persisted
      end

      specify "a record is persisted when pulled out of the database, and still persisted when modified and saved" do
        DB[:blogs] << {:id => 1, :title => "Hi!"}
        blog = Blog.find(1)
        blog.should be_persisted
        blog.title = "HO!"
        blog.should be_persisted
        blog.save
        blog.should be_persisted
      end
    end
  end
end
