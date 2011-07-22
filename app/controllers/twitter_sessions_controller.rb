class TwitterSessionsController < ApplicationController
  def create
    unless user = User.find(:twitter_id => twitter_id)
      name_parts = params[:name].split(" ")
      first_name = name_parts.shift
      last_name = name_parts.join(" ")
      attrs = { :first_name => first_name, :last_name => last_name, :twitter_id => twitter_id }
      user = User.create!(attrs)
    end

    set_current_user user

    render :json => {
      :data => { :current_user_id => current_user_id },
      :records => build_client_dataset(current_user.initial_repository_contents)
    }
  #rescue FbGraph::Auth::VerificationFailed => e
  #  raise SecurityError
  end

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
