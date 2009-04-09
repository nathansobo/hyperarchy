require File.expand_path("#{File.dirname(__FILE__)}/ce2_spec_helper")

describe SqlQuery do
  attr_reader :query
  before do
    @query = SqlQuery.new
  end

  describe "#to_sql" do
    context "when there is only one #from_set" do
      before do
        query.add_from_set(Answer.set)
      end

      it "generates a simple select" do
        query.to_sql.should == "select #{query.projected_attributes_sql} from answers;"
      end
    end

    context "when there are multiple #conditions" do
      before do
        query.add_from_set(Answer.set)
        query.add_condition(Predicates::Eq.new(Answer.correct, true))
        query.add_condition(Predicates::Eq.new(Answer.body, "Peaches"))
      end

      it "generates a select with a where clause having all conditions and'ed together" do
        query.to_sql.should == %{select #{query.projected_attributes_sql} from answers where answers.correct = true and answers.body = "Peaches";}
      end
    end
  end

  describe "#add_from_set" do
    it "adds the given Set to #from_sets" do
      query.add_from_set(Answer.set)
      query.from_sets.should == [Answer.set]
      query.add_from_set(Question.set)
      query.from_sets.should == [Answer.set, Question.set]
    end
  end

  describe "#add_condition" do
    it "adds the given Predicate to #conditions" do
      predicate_1 = Predicates::Eq.new(Answer.correct, true)
      predicate_2 = Predicates::Eq.new(Answer.correct, false)
      query.add_condition(predicate_1)
      query.conditions.should == [predicate_1]
      query.add_condition(predicate_2)
      query.conditions.should == [predicate_1, predicate_2]
    end
  end

  describe "#projected_set" do
    context "if #projected_set= has not been called" do
      it "returns the first Set in #from_sets" do
        query.add_from_set(Answer.set)
        query.projected_set.should == Answer.set
      end
    end

    context "if #projected_set= has been called" do
      it "returns the Set that was assigned" do
        query.projected_set = Question.set
        query.projected_set.should == Question.set
      end
    end
  end
end