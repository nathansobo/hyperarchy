module Monarch
  module Model
    module Relations
      class Offset < RetrievalDirective
        def internal_sql_offset(state)
          Sql::Literal.new(state.next_literal_placeholder_name, count)
        end
      end
    end
  end
end