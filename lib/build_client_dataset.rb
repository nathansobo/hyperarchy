module BuildClientDataset
  def build_client_dataset(*records_or_relations)
    (Hash.new {|h,k| h[k] = {}}).tap do |dataset|
      Array(records_or_relations).flatten.each do |r|
        r.add_to_client_dataset(dataset)
      end
    end
  end
end
