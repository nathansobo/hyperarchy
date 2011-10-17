#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

class SharesController < ApplicationController
  def create
    Share.create!(params.slice(:code, :service, :question_id))
    head :ok
  end
end
