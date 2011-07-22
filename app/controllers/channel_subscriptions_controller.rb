class ChannelSubscriptionsController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def create
    organization = Organization.find(params[:id])
    raise SecurityError, "You do not have read permissions for org #{params[:id]}" unless organization.current_user_can_read?

    post(organization.subscribe_url, :params => params.slice(:session_id, :reconnecting).symbolize_keys)
    head :ok
  end

  def destroy
    organization = Organization.find(params[:id])
    delete(organization.subscribe_url, :params => {:session_id => params[:session_id]})
    head :ok
  end
end
