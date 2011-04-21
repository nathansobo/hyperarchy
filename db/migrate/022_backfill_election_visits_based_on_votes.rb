Sequel.migration do
  up do
    self[:votes].each do |vote_field_values|
      vote_field_values.delete(:id)
      self[:election_visits].insert(vote_field_values)
    end
  end
end
