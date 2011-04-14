class MembershipsController < ApplicationController
  before_filter :require_authentication

  def confirm
    membership = Membership.find(params[:id])
    if membership.user == current_user
      membership.update(:pending => false)
      redirect_to root_url(:anchor => "view=organization&organizationId=#{membership.organization_id}")
    else
      redirect_to root_url(:anchor => "view=organization&organizationId=#{current_user.default_organization.id}")
    end
  end
end
