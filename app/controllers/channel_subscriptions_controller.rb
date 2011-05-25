class ChannelSubscriptionsController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def create
    subscribe_url = "http://localhost:8081/channel_subscriptions/#{params[:type]}/#{params[:id]}"
    Typhoeus::Request.post(subscribe_url, :params => {:session_id => params[:session_id]})

    publish_url = "http://localhost:8081/channel_events/#{params[:type]}/#{params[:id]}"
    Typhoeus::Request.post(publish_url, :params => {:message => "Hello from Rails Server!!!"})

    head :ok
  end
end