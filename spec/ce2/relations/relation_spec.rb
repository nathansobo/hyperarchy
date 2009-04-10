require File.expand_path("#{File.dirname(__FILE__)}/../ce2_spec_helper")

module Relations
  describe Relation do
    describe "#where" do
      it "returns a Selection with self as #operand and the given Predicate as #predicate" do
        predicate = Answer.id.eq("grain_quinoa")
        selection = Answer.set.where(predicate)
        selection.class.should == Selection
        selection.operand.should == Answer.set
        selection.predicate.should == predicate
      end
    end

    describe "#join, #on" do
      it "returns an InnerJoin with self as #left_operand and the given Relation as #right_operand, then the Predicate passed to .on as its #predicate" do
        predicate = Answer.question_id.eq(Question.id)
        join = Question.set.join(Answer.set).on(predicate)
        join.class.should == InnerJoin
        join.left_operand.should == Question.set
        join.right_operand.should == Answer.set
        join.predicate.should == predicate
      end
    end

    describe "#project" do
      it "returns a SetProjection with self as #operand and the given Set as its #projected_set" do
        join = Question.set.join(Answer.set).on(Answer.question_id.eq(Question.id))
        projection = join.project(Answer.set)
        projection.class.should == SetProjection
        projection.operand.should == join
        projection.projected_set.should == Answer.set
      end
    end
  end
end