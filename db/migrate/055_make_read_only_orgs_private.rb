Sequel.migration do
  up do
    self[:organizations].filter(:privacy => 'read_only').update(:privacy => 'private')
  end
end
