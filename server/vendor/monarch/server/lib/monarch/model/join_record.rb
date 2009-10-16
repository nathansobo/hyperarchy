module Model
  class JoinRecord
    class << self
      attr_accessor :constituent_tables
    end

    delegate :constituent_tables, :to => "self.class"
    attr_reader :constituent_records_by_table
    
    def initialize(field_values)
      @constituent_records_by_table = {}
      constituent_tables.each do |table|
        constituent_records_by_table[table] = build_constituent_record(table, field_values)
      end
    end

    def build_constituent_record(table, field_values)
      table_specific_field_values = {}
      field_values.each do |field_name, value|
        table_specific_field_name = field_name.to_s.gsub!("#{table.global_name}__", "")
        if table_specific_field_name
          table_specific_field_values[table_specific_field_name] = value
        end
      end
      table.record_class.unsafe_new(table_specific_field_values)
    end

    def [](table_or_record_class)
      constituent_records_by_table[table_or_record_class.table]
    end
  end
end
