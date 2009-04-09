require File.expand_path("#{File.dirname(__FILE__)}/../ce2_spec_helper")

module Relations
  describe Selection do
    attr_reader :operand, :predicate, :selection
    before do
      @operand = Answer.set
      @predicate = Predicates::Eq.new(Answer.correct, false)
      @selection = Selection.new(operand, predicate)
    end

    describe "#tuples" do
      
    end

    describe "#to_sql" do
      it "generates a query with an appropriate where clause" do
        selection.to_sql.should == "select #{operand.attributes.map {|a| a.to_sql}.join(", ")} from #{operand.global_name} where #{predicate.to_sql};"
      end
    end
  end
end