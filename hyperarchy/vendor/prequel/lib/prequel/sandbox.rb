module Prequel
  class Sandbox
    class << self
      def expose(name, &definition)
        exposed_relation_definitions[name] = definition
        def_relation_accessor(name)
      end

      def exposed_relation_definitions
        @exposed_relation_definitions ||= {}.with_indifferent_access
      end

      def def_relation_accessor(name)
        define_method(name) do
          get_relation(name)
        end
      end
    end

    delegate :exposed_relation_definitions, :to => 'self.class'

    def create(relation_name, field_values)
      record = get_relation(relation_name).new(field_values)
      if record.save
        [201, record.wire_representation]
      else
        [400, record.errors]
      end
    end

    def fetch(*wire_reps)
      (Hash.new {|h,k| h[k] = {}}).tap do |dataset|
        wire_reps.each do |wire_rep|
          evaluate(wire_rep).add_to_client_dataset(dataset)
        end
      end
    end

    def get_relation(name)
      instance_eval(&exposed_relation_definitions[name])
    end

    def evaluate(wire_rep)
      wire_rep = wire_rep.with_indifferent_access

      case wire_rep[:type]
      when 'table'
        get_relation(wire_rep[:name])
      when 'selection'
        Relations::Selection.new(evaluate(wire_rep[:operand]), evaluate(wire_rep[:predicate]))
      when 'inner_join'
        Relations::InnerJoin.new(evaluate(wire_rep[:left_operand]), evaluate(wire_rep[:right_operand]), evaluate(wire_rep[:predicate]))
      when 'table_projection'
        Relations::Projection.new(evaluate(wire_rep[:operand]), wire_rep[:projected_table].to_sym)
      when 'eq'
        Expressions::Equal.new(evaluate(wire_rep[:left_operand]), evaluate(wire_rep[:right_operand]))
      when 'column'
        "#{wire_rep[:table]}__#{wire_rep[:name]}".to_sym
      when 'scalar'
        wire_rep[:value]
      else
        raise "Can't evaluate #{wire_rep.inspect}"
      end
    end
  end
end