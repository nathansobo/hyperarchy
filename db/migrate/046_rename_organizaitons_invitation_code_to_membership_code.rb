Sequel.migration do
  up do
    rename_column :organizations, :invitation_code, :membership_code
  end

  down do
    rename_column :organizations, :membership_code, :membership_code
  end
end

