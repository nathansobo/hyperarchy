module Monarch
  module Model
    class InvalidRecordException < Exception
      attr_reader :record, :validation_errors_by_column_name

      def initialize(record, validation_errors_by_column_name)
        @record, @validation_errors_by_column_name = record, validation_errors_by_column_name
      end

      def message
        errors = validation_errors_by_column_name.map do |column_name, errors|
          "#{column_name}: #{errors.join(", ")}"
        end.join("; ")

        "Invalid #{record.class.basename} instance. #{errors}"
      end
    end
  end
end