require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Relations
    describe Relation do
      describe "class methods" do
        describe "#from_wire_representation" do
          attr_reader :exposed_repository
          before do
            @exposed_repository = UserRepository.new(User.find("jan"))
          end

          context "when the given representation's type is 'table'" do
            it "resolves the name of the table in the given repository" do
              relation = Relation.from_wire_representation({
                "type" => "table",
                "name" => "blog_posts"
              }, exposed_repository)
              relation.should == exposed_repository.resolve_table_name(:blog_posts)
            end
          end

          context "when the given representation's type is 'selection'" do
            it "delegates to Selection.from_wire_representation" do
              representation = {
                "type" => "selection",
                "operand" => {
                  "type" => "table",
                  "name" => "answers"
                },
                "predicate" => {
                  "type" => "eq",
                  "left_operand" => {
                    "type" => "column",
                    "table" => "answers",
                    "name" => "correct"
                  },
                  "right_operand" => {
                    "type" => "scalar",
                    "value" => true
                  }
                }
              }
              mock(Selection).from_wire_representation(representation, exposed_repository)
              Relation.from_wire_representation(representation, exposed_repository)
            end
          end

          context "when the given representation's type is 'inner_join'" do
            it "delegates to InnerJoin.from_wire_representation" do
              representation = {
                "type" => "inner_join",
                "left_operand" => {
                  "type" => "table",
                  "name" => "questions"
                },
                "right_operand" => {
                  "type" => "table",
                  "name" => "answers"
                },
                "predicate" => {
                  "type" => "eq",
                  "left_operand" => {
                    "type" => "column",
                    "table" => "questions",
                    "name" => "id"
                  },
                  "right_operand" => {
                    "type" => "column",
                    "table" => "answers",
                    "name" => "question_id"
                  }
                }
              }

              mock(InnerJoin).from_wire_representation(representation, exposed_repository)
              Relation.from_wire_representation(representation, exposed_repository)
            end
          end

          context "when the given representation's type is 'table_projection'" do
            it "delegates to TableProjection.from_wire_representation" do
              representation = {
                "type" => "table_projection",
                "projected_table" => "answers",
                "operand" => {
                  "type" => "inner_join",
                  "left_operand" => {
                    "type" => "table",
                    "name" => "questions"
                  },
                  "right_operand" => {
                    "type" => "table",
                    "name" => "answers"
                  },
                  "predicate" => {
                    "type" => "eq",
                    "left_operand" => {
                      "type" => "column",
                      "table" => "questions",
                      "name" => "id"
                    },
                    "right_operand" => {
                      "type" => "column",
                      "table" => "answers",
                      "name" => "question_id"
                    }
                  }
                }
              }

              mock(TableProjection).from_wire_representation(representation, exposed_repository)
              Relation.from_wire_representation(representation, exposed_repository)
            end
          end
        end
      end

      describe "instance methods" do
        describe "#where(predicate)" do
          it "returns a Selection with self as #operand and the given Predicate as #predicate" do
            predicate = BlogPost[:id].eq("grain_quinoa")
            selection = BlogPost.table.where(predicate)
            selection.class.should == Selection
            selection.operand.should == BlogPost.table
            selection.predicate.should == predicate
          end
        end

        describe "#join(relation).on(predicate)" do
          context "when passed a Table" do
            it "returns an InnerJoin with self as #left_operand and the given Relation as #right_operand, then the Predicate passed to .on as its #predicate" do
              predicate = BlogPost[:blog_id].eq(Blog[:id])
              join = Blog.table.join(BlogPost.table).on(predicate)
              join.class.should == InnerJoin
              join.left_operand.should == Blog.table
              join.right_operand.should == BlogPost.table
              join.predicate.should == predicate
            end
          end

          context "when passed a subclass of Record" do
            it "returns an InnerJoin with self as #left_operand and the #table of the given Record subclass as #right_operand, then the Predicate passed to .on as its #predicate" do
              predicate = BlogPost[:blog_id].eq(Blog[:id])
              join = Blog.table.join(BlogPost).on(predicate)
              join.class.should == InnerJoin
              join.left_operand.should == Blog.table
              join.right_operand.should == BlogPost.table
              join.predicate.should == predicate
            end
          end
        end

        describe "#join_through(table)" do
          it "automatically joins the receiver with the given table on an inferred foreign key and then projects the given table" do
            relation = Blog.where(Blog[:user_id].eq('jan'))
            relation.join_through(BlogPost).should == relation.join(BlogPost).on(Blog[:id].eq(BlogPost[:blog_id])).project(BlogPost)
            BlogPost.join_through(Blog).should == BlogPost.join(Blog).on(BlogPost[:blog_id].eq(Blog[:id])).project(Blog)
          end
        end

        describe "#project" do
          attr_reader :join

          before do
            @join = Blog.table.join(BlogPost.table).on(BlogPost[:blog_id].eq(Blog[:id]))
          end

          context "when passed a Table" do
            it "returns a TableProjection with self as #operand and the given Table as its #projected_table" do
              projection = join.project(BlogPost.table)
              projection.class.should == TableProjection
              projection.operand.should == join
              projection.projected_table.should == BlogPost.table
            end
          end

          context "when passed a subclass of Record" do
            it "returns a TableProjection with self as #operand and the #table of the given Record subclass as its #projected_table" do
              projection = join.project(BlogPost)
              projection.class.should == TableProjection
              projection.operand.should == join
              projection.projected_table.should == BlogPost.table
            end
          end

          context "when passed ProjectedColumns and Columns" do
            it "returns a Projection with ProjectedColumns corresponding to the given concrete_columns" do
              blog_title = Blog[:title].as(:blog_title)
              projection = join.project(blog_title, BlogPost[:title])
              projection.concrete_columns[0].should == blog_title
              blog_post_title = projection.concrete_columns[1]
              blog_post_title.should be_an_instance_of(ProjectedColumn)
              blog_post_title.column.should == BlogPost[:title]
            end
          end

          context "when passed a Table and a ConcreteColumn" do
            it "returns a Projection with ProjectedColumns corresponding to all the concrete_columns in the given table and also the other given concrete_columns" do
              projection = join.project(Blog.table, BlogPost[:body])
              concrete_columns = projection.concrete_columns

              concrete_columns.size.should == Blog.table.concrete_columns.size + 1
              Blog.table.concrete_columns.each_with_index do |blog_column, index|
                concrete_columns[index].should be_an_instance_of(ProjectedColumn)
                concrete_columns[index].column.should == blog_column
              end
              concrete_columns.last.should be_an_instance_of(ProjectedColumn)
              concrete_columns.last.column.should == BlogPost[:body]
            end
          end

          context "when passed a subclass of Record and a ProjectedColumn" do
            it "returns a Projection with ProjectedColumns corresponding to all the concrete_columns in the given record class's table and also the other given concrete_columns" do
              blog_post_title = BlogPost[:title].as(:blog_post_title)
              projection = join.project(Blog, blog_post_title)
              concrete_columns = projection.concrete_columns
              concrete_columns.size.should == Blog.table.concrete_columns.size + 1
              Blog.table.concrete_columns.each_with_index do |blog_column, index|
                concrete_columns[index].should be_an_instance_of(ProjectedColumn)
                concrete_columns[index].column.should == blog_column
              end
              concrete_columns.last.should == blog_post_title
            end
          end
        end

        describe "#find" do
          context "when passed an id" do
            it "returns the first Record in a Selection where id is equal to the given id" do
              BlogPost.table.find("grain_quinoa").should == BlogPost.table.where(BlogPost[:id].eq("grain_quinoa")).all.first
            end
          end

          context "when passed a Predicate" do
            it "returns the first Record in the Relation that matches the Predicate" do
              BlogPost.table.find(BlogPost[:body].eq("Millet")).should == BlogPost.where(BlogPost[:body].eq("Millet")).all.first
            end
          end
        end

        describe "#each" do
          specify "delegates to #all of #table" do
            all = []
            stub(BlogPost.table).all { all }

            block = lambda {}
            mock(all).each(&block)
            BlogPost.table.each(&block)
          end
        end
      end
    end
  end
end
