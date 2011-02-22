require 'spec_helper'

describe ApplicationController do
  controller do
    def index
      render :text => "ok"
    end
  end

  it "initializes and clears the local identity map on the repository" do
    mock(Monarch::Model::Repository).initialize_local_identity_map.ordered
    mock(Monarch::Model::Repository).clear_local_identity_map.ordered
    get :index
  end

  it "sets the current user on the model" do
    login_as(User.make)
    mock(Monarch::Model::Repository).current_user = current_user
    get :index
  end
end