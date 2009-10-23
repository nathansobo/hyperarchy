# TODO: include a more exhaustive list here
module Model
  module ForwardsArrayMethodsToRecords
    def each(&block)
      all.each(&block)
    end

    def first
      all.first
    end
  end
end
