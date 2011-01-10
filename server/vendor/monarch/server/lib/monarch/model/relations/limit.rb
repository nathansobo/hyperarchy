module Monarch
  module Model
    module Relations
      class Limit < RetrievalDirective
        def internal_sql_limit
          count
        end
      end
    end
  end
end