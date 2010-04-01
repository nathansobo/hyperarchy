module Util
  module BuildRelationalDataset
    def build_relational_dataset(records_or_relations)
      dataset = {}
      Array(records_or_relations).each do |r|
        r.add_to_relational_dataset(dataset)
      end
      dataset
    end
  end
end