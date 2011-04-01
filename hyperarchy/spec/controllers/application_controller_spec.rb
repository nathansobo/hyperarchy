require 'spec_helper'

describe ApplicationController do
  controller do
    def index
      raise if params[:explode]
      render :text => "ok"
    end

    def explode
      raise
    end
  end

  it "clears the Prequel session after the request, even if an exception occurred" do
    mock(Prequel).clear_session
    get :index

    mock(Prequel).clear_session
    expect { get :index, :explode => true }.to raise_error
  end

  it "sets the current user on the model" do
    login_as(User.make)
    mock(Prequel.session).current_user = current_user
    get :index
  end
end