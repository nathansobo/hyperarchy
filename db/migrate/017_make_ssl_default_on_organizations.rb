Sequel.migration do
  up do
    alter_table(:organizations) do
      set_column_default :use_ssl, true
    end
  end
end
