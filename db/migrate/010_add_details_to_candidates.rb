Sequel.migration do
  up do
    add_column(:candidates, :details, String, :default => "")
  end
end
