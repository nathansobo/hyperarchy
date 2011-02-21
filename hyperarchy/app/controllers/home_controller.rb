class HomeController < ApplicationController
  layout false

  def show
    set_current_user(User.guest) unless current_user
  end
end
