#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

class HomeController < ApplicationController
  def show
    session[:share_code] = params[:s] if params[:s]
  end
end
