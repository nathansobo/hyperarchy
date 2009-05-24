# TODO: include a more exhaustive list here
module Model
  module ForwardsArrayMethodsToTuples
    def each(&block)
      tuples.each(&block)
    end
  end
end