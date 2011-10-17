#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

class SandboxController < ApplicationController
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

  def sandbox
    @sandbox ||= Sandbox.new(current_user)
  end
end
