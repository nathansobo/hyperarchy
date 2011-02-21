module Monarch
  module Model
    module Relations
      class Limit < RetrievalDirective
        def internal_sql_limit(state)
          Sql::Literal.new(state.next_literal_placeholder_name, count)
        end
      end
    end
  end
end