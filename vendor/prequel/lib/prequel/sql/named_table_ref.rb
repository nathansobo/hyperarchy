module Prequel
  module Sql
    module NamedTableRef
      protected

      def extract_field_values(field_values)
        {}.tap do |specific_field_values|
          field_values.each do |field_name, value|
            if field_name =~ /(.+?)__(.+)/
              qualifier, field_name = $1.to_sym, $2.to_sym
              next unless qualifier == name
            end
            specific_field_values[field_name] = value
          end
        end
      end
    end
  end
end