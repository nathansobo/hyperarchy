class MembershipsController < ApplicationController
  before_filter :require_authentication, :only => :confirm

  def create
    organization = Organization.find(:id => params[:organization_id], :membership_code => params[:code])
    unless organization
      redirect_to(root_url(:anchor => "view=organization&organizationId=#{current_user.default_organization.id}"))
      return
    end
    if current_user.guest?
      set_current_user(organization.guest)
    elsif !current_user.memberships.find(:organization => organization)
      current_user.memberships.create!(:organization => organization)
    end
    
    redirect_to(root_url(:anchor => "view=organization&organizationId=#{organization.id}"))
  end
end
