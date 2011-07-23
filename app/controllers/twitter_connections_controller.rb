class TwitterConnectionsController < ApplicationController
  def create
    raise SecurityError if current_user.guest?

    if existing_user = User.find(:twitter_id => twitter_id)
      existing_user.update!(:twitter_id => 0)
    end

    current_user.update!(:twitter_id => twitter_id)

    render :json => build_client_dataset(current_user)
  end

  protected

  def twitter_id
    validate_twitter_cookie
    cookies["twitter_anywhere_identity"].split(":").first
  end

  def validate_twitter_cookie
    twitter_id, signature = cookies["twitter_anywhere_identity"].split(":")
    unless signature == Digest::SHA1.hexdigest("#{twitter_id}#{TWITTER_SECRET}")
      raise SecurityError, "Invalid Twitter signature"
    end
  end

end
