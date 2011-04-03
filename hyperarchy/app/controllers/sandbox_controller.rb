class SandboxController < ApplicationController
  before_filter :authentication_required

  def fetch
    render :json => sandbox.fetch(JSON.parse(params[:relations]))
  end

  def create
    status, response = sandbox.create(params[:relation], params[:field_values])
    render :status => status, :json => response.to_json
  end

  protected

  def sandbox
    @sandbox ||= Sandbox.new(current_user)
  end
end
