class HomeController < ApplicationController
  def show
    session[:share_code] = params[:s] if params[:s]
  end
end
