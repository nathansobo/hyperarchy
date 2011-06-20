module GuidGeneration
  def make_guid
    UUIDTools::UUID.random_create.to_s
  end
end
