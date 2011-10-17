#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

module HttpClient
  def post(url, options={})
    Typhoeus::Request.post(url, options)
  end

  def delete(url, options={})
    Typhoeus::Request.delete(url, options)
  end
end
