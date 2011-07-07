class SandboxController < ApplicationController
  before_filter :slow_it_down

  def fetch
    render :json => sandbox.fetch(*JSON.parse(params[:relations]))
  end

  def create
    status, response = sandbox.create(params[:relation], params[:field_values])
    render :status => status, :json => response.to_json
  end

  def update
    status, response = sandbox.update(params[:relation], params[:id], params[:field_values])
    render :status => status, :json => response.to_json
  end

  def destroy
    status, response = sandbox.destroy(params[:relation], params[:id])
    render :status => status, :json => response
  end

  protected

  def slow_it_down
    sleep 2
  end

  def sandbox
    @sandbox ||= Sandbox.new(current_user)
  end
end
