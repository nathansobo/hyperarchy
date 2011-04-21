class UsersController < ApplicationController
  def new
    @user = User.new
  end

  def create
    user = User.secure_new(params[:user])
    user.save
    set_current_user(user)

    organization = Organization.secure_new(params[:organization])
    organization.save

    redirect_to root_path(:anchor => "view=organization&organizationId=#{organization.id}")
  end
end
