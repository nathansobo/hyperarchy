# TODO: include a more exhaustive list here
module Model
  module ForwardsArrayMethodsToRecords
    def each(&block)
      records.each(&block)
    end
  end
end
