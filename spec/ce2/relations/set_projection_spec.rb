require File.expand_path("#{File.dirname(__FILE__)}/../ce2_spec_helper")

module Relations
  describe SetProjection do
    attr_reader :join, :projection, :composite_join, :composite_projection
    before do
      @join = QuestionSet.set.where(QuestionSet.id.eq("foods")).join(Question.set).on(Question.question_set_id.eq(QuestionSet.id))
      @projection = SetProjection.new(join, Question.set)

      @composite_join = projection.join(Answer.set).on(Answer.question_id.eq(Question.id))
      @composite_projection = SetProjection.new(composite_join, Answer.set)
    end

    describe "#tuples" do
      it "executes an appropriate SQL query against the database and returns Tuples corresponding to its results" do
        tuples = projection.tuples
        tuples.should_not be_empty
        tuples.each do |tuple|
          tuple.class.should == Question 
        end
      end
    end

    describe "#to_sql" do
      context "when the composed relation contains only one SetProjection" do
        it "generates a query that selects the attributes of #projected_set and includes all joined tables in its from clause" do
          projected_columns = projection.projected_set.attributes.map {|a| a.to_sql}.join(", ")
          projection.to_sql.should == %{select #{projected_columns} from question_sets, questions where questions.question_set_id = question_sets.id and question_sets.id = "foods";}
        end
      end

      context "when the composed relation contains more than one SetProjection" do
        it "generates a query that selects the attributes of #projected_set and includes all joined tables in its from clause" do
          projected_columns = composite_projection.projected_set.attributes.map {|a| a.to_sql}.join(", ")
          composite_projection.to_sql.should == %{select #{projected_columns} from question_sets, questions, answers where answers.question_id = questions.id and questions.question_set_id = question_sets.id and question_sets.id = "foods";}
        end
      end
    end
  end
end