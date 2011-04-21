Sequel.migration do
  up do
    add_column(:organizations, :use_ssl, TrueClass, :default => false)
  end
end
