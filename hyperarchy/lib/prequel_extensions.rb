module Prequel
  class Session
    attr_accessor :current_user
  end

  class Record
    class << self
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
    end

    def current_user
      Prequel.session.current_user
    end

    #TODO: make lock/unlock work
    def lock
    end

    def unlock
    end

    def can_update_columns?(columns)
      (columns - (update_whitelist - update_blacklist)).empty?
    end
  end
end