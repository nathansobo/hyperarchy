module Monarch
  module Model
    module Relations
      class Limit < RetrievalDirective
        def internal_sql_limit
          n
        end
      end
    end
  end
end