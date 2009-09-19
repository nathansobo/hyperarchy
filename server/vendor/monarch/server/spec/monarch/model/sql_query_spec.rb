require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Model
  describe SqlQuery do
    attr_reader :query
    before do
      @query = SqlQuery.new
    end

    describe "#to_sql" do
      context "when there is only one #from_table" do
        before do
          query.add_from_table(BlogPost.table)
        end

        it "generates a simple select" do
          query.to_sql.should == "select #{query.projected_columns_sql} from blog_posts;"
        end
      end

      context "when there are multiple #conditions" do
        before do
          query.add_from_table(BlogPost.table)
          query.add_condition(Predicates::Eq.new(BlogPost[:blog_id], "grain"))
          query.add_condition(Predicates::Eq.new(BlogPost[:body], "Peaches"))
        end

        it "generates a select with a where clause having all conditions and'ed together" do
          query.to_sql.should == %{select #{query.projected_columns_sql} from blog_posts where blog_posts.blog_id = "grain" and blog_posts.body = "Peaches";}
        end
      end
    end

    describe "#add_from_table" do
      it "adds the given Table to #from_tables" do
        query.add_from_table(BlogPost.table)
        query.from_tables.should == [BlogPost.table]
        query.add_from_table(Blog.table)
        query.from_tables.should == [BlogPost.table, Blog.table]
      end
    end

    describe "#add_condition" do
      it "adds the given Predicate to #conditions" do
        predicate_1 = Predicates::Eq.new(BlogPost[:blog_id], "grain")
        predicate_2 = Predicates::Eq.new(BlogPost[:blog_id], "vegetable")
        query.add_condition(predicate_1)
        query.conditions.should == [predicate_1]
        query.add_condition(predicate_2)
        query.conditions.should == [predicate_1, predicate_2]
      end
    end

    describe "#projected_table" do
      context "if #projected_table= has not been called" do
        it "returns the first Table in #from_tables" do
          query.add_from_table(BlogPost.table)
          query.projected_table.should == BlogPost.table
        end
      end

      context "if #projected_table= has been called" do
        it "returns the Table that was assigned" do
          query.projected_table = Blog.table
          query.projected_table.should == Blog.table
        end
      end
    end
  end
end
