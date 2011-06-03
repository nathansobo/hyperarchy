module Prequel
  module Validations
    def validates_uniqueness_of(column_name, options={})
      column = table.get_column(column_name)
      raise "No column #{column_name.inspect} to validate the uniqueness of" unless column
      validate do
        field_value = get_field_value(column_name)
        relation = table.where(column_name => field_value)
        relation = relation.where(:id.neq(id)) if persisted?
        unless relation.empty?
          errors.add(column_name, options[:message] || "#{column_name.to_s.humanize} must be unique")
        end
      end
    end

    def validates_presence_of(column_name, options={})
      column = table.get_column(column_name)
      raise "No column #{column_name.inspect} to validate the uniqueness of" unless column
      validate do
        field_value = get_field_value(column_name)
        if field_value.blank?
          errors.add(column_name, options[:message] || "#{column_name.to_s.humanize} must not be blank")
        end
      end
    end
  end
end