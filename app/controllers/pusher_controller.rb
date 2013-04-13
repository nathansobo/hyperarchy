class PusherController < ApplicationController
  protect_from_forgery :except => :auth # stop rails CSRF protection for this action

  def auth
    channel_name = params[:channel_name]
    socket_id = params[:socket_id]

    if match = channel_name.match(/private-\w+-group-(\d+)/)
      group_id = match[1].to_i
      auth_group_channel(channel_name, group_id, socket_id)
    elsif match = channel_name.match(/private-\w+-user-(\d+)/)
      user_id = match[1].to_i
      auth_user_channel(channel_name, user_id, socket_id)
    else
      render :status => 404, :text => "Don't know how to auth to #{channel_name}"
    end
  end

  private

  def auth_group_channel(channel_name, group_id, socket_id)
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

  def auth_user_channel(channel_name, user_id, socket_id)
    if current_user_id == user_id
      render :json => authenticate_on_channel(channel_name, socket_id)
    else
      render :text => "You're not that user", :status => 403
    end
  end

  def authenticate_on_channel(channel_name, socket_id)
    Pusher[channel_name].authenticate(socket_id)
  end

  def ensure_authenticated
    render :text => "Not authenticated", :status => 403 unless current_user
  end
end
