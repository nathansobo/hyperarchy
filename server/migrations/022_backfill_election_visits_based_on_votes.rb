Sequel.migration do
  up do
    self[:votes].each do |vote_field_values|
      self[:election_visits].insert(vote_field_values)
    end
  end
end
