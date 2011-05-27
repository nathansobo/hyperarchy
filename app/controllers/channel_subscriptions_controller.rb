class ChannelSubscriptionsController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def create
    subscribe_url = "http://#{SOCKET_SERVER_HOST}/channel_subscriptions/organizations/#{params[:id]}"
    organization = Organization.find(params[:id])
    raise SecurityError, "You do not have read permissions for org #{params[:id]}" unless organization.current_user_can_read?
      
    post(subscribe_url, :params => {:session_id => params[:session_id]})
    head :ok
  end
end
