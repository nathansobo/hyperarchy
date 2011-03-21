Sequel.migration do
  up do
    [35, 42, 43].each do |user_id|
      self[:users].where(:id => user_id).delete
      self[:memberships].where(:id => user_id).delete
    end

    [7, 9, 10].each do |org_id|
      self[:organizations].where(:id => org_id).delete
    end
  end
end
