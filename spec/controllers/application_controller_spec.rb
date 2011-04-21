require 'spec_helper'

describe ApplicationController do
  controller do
    def index
      raise if params[:explode]
      render :text => "ok"
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

  describe "the #require_authentication before filter" do
    controller do
      before_filter :require_authentication

      def index
        render :text => "ok"
      end
    end

    context "when a normal user is logged in" do
      before do
        login_as(User.make)
      end

      it "allows the action to proceed" do
        get :index
        response.should be_success
      end
    end

    context "when a guest is logged in" do
      before do
        login_as(User.guest)
      end

      context "for a normal request" do
        it "logs the guest out, sets the after_login_path in the session, then redirects to the login_url" do
          get :index
          current_user.should be_nil
          session[:after_login_path].should == request.path_info
          response.should redirect_to(controller.login_path)
        end
      end

      context "for an xhr request" do
        it "returns 403 forbidden" do
          xhr :get, :index
          response.should be_forbidden
        end
      end
    end

    context "when no one is logged in" do
      context "for a normal request" do
        it "sets the after_login_path in the session and redirects to the login_url" do
          get :index
          session[:after_login_path].should == request.path_info
          response.should redirect_to(controller.login_url)
        end
      end

      context "for an xhr request" do
        it "returns 403 forbidden" do
          xhr :get, :index
          response.should be_forbidden
        end
      end
    end
  end

  describe "the #allow_guests before filter" do
    controller do
      before_filter :allow_guests

      def index
        render :text => "ok"
      end
    end

    context "when a normal user is logged in" do
      attr_reader :user
      before do
        @user = login_as User.make
      end

      it "allows the request to proceed" do
        get :index
        response.should be_success
        current_user.should == user
      end
    end

    context "when a guest is logged in" do
      before do
        login_as User.guest
      end

      it "allows the request to proceed" do
        get :index
        response.should be_success
        current_user.should == User.guest
      end
    end

    context "when no one is logged in" do
      it "authenticates the guest user and allows the request to proceed" do
        get :index
        response.should be_success
        current_user.should == User.guest
      end
    end
  end
end