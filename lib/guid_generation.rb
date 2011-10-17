#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

module GuidGeneration
  def make_guid
    UUIDTools::UUID.random_create.to_s
  end
end
