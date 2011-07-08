class MembershipsController < ApplicationController
  before_filter :require_authentication, :only => :confirm

  def create
    organization = Organization.find(:id => params[:organization_id], :membership_code => params[:code])
    unless organization
      redirect_to organization_url(current_user.default_organization)
      return
    end
    if current_user.guest?
      set_current_user(organization.guest)
    elsif !current_user.memberships.find(:organization => organization)
      current_user.memberships.create!(:organization => organization)
    end
    
    redirect_to organization_url(organization)
  end
end
