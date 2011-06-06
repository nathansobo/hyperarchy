Sequel.migration do
  up do
    require "securerandom"

    add_column :organizations, :invitation_code, String
    self[:organizations].each do |organization|
      id = organization[:id]
      self[:organizations].filter(:id => id).update(:invitation_code => SecureRandom.hex(8))
    end
  end

  down do
    drop_column :organizations, :invitation_code
  end
end
