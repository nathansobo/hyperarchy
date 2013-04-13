class PusherController < ApplicationController
  protect_from_forgery :except => :auth # stop rails CSRF protection for this action

  def auth
    channel_name = params[:channel_name]
    socket_id = params[:socket_id]
    group_id = channel_name.match(/private-group-(\d+)/)[1].to_i

    unless group = Group.find(group_id)
      render :text => "Group not found", :status => 404
      return
    end

    if group.has_member?(current_user)
      render :json => authenticate_on_channel(channel_name, socket_id)
    else
      render :text => "Not a group member", :status => 403
    end
  end

  private

  def authenticate_on_channel(channel_name, socket_id)
    Pusher[channel_name].authenticate(socket_id)
  end

  def ensure_authenticated
    render :text => "Not authenticated", :status => 403 unless current_user
  end
end
