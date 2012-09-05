class HomeController < ApplicationController
  before_filter :ensure_authenticated

  def index

  end
end
