#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

module BuildClientDataset
  def build_client_dataset(*records_or_relations)
    (Hash.new {|h,k| h[k] = {}}).tap do |dataset|
      Array(records_or_relations).flatten.each do |r|
        r.add_to_client_dataset(dataset)
      end
    end
  end
end
