Sequel.migration do
  up do

    # find all columns of type :datetime
    time_columns = {}
    tables.each do |table|
      time_columns[table] =
        schema(table).select{|column| column[1][:type] == :datetime}.map{|column| column[0]}
    end

    tables.each do |table|
      time_columns[table].each do |column|
        alter_table table do
          set_column_type column, 'timestamp with time zone'
        end
      end
    end
  end

  down do

    # find all columns of type :datetime
    time_columns = {}
    tables.each do |table|
      time_columns[table] =
        schema(table).select{|column| column[1][:type] == :datetime}.map{|column| column[0]}
    end

    tables.each do |table|
      time_columns[table].each do |column|
        alter_table table do
          set_column_type column, 'timestamp with time zone'
        end
      end
    end
  end
end
