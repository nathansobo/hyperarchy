class SandboxController < ApplicationController
  before_filter :authentication_required

  def fetch
    render :json => sandbox.fetch(JSON.parse(params[:relations]))
  end

  protected

  def sandbox
    @sandbox ||= Sandbox.new(current_user)
  end
end
