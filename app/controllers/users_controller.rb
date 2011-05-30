class UsersController < ApplicationController
  def new
    @user = User.new
  end

  def create
    user = User.secure_new(params[:user])
    if user.save
      set_current_user(user)

      if params[:organization]
        organization = Organization.secure_create(params[:organization])
      end

      render :json => {
        'data' => { 'current_user_id' => user.id },
        'records' => build_client_dataset(current_user.initial_repository_contents)
      }
    else
      render :status => 422, :json => {
        'errors' => user.errors.full_messages
      }
    end
  end
end
