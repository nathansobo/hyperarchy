class FacebookConnectionsController < ApplicationController
  def create
    raise SecurityError if current_user.guest?

    facebook_id = fb_user.identifier
    if existing_user = User.find(:facebook_id => facebook_id)
      existing_user.update!(:facebook_id => 0)
    end

    current_user.update!(:facebook_id => facebook_id)

    render :json => build_client_dataset(current_user)

  rescue FbGraph::Auth::VerificationFailed => e
    raise SecurityError
  end
end
