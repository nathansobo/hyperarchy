module Monarch
  module Model
    module Relations
      class Offset < RetrievalDirective
        def internal_sql_offset
          count
        end
      end
    end
  end
end