class MembershipsController < ApplicationController
  before_filter :require_authentication, :only => :confirm

  def create
    organization = Organization.find(:id => params[:organization_id])
    if !organization || organization.membership_code != params[:code]
      redirect_to(root_url(:anchor => "view=organization&organizationId=#{current_user.default_organization.id}"))
      return
    end
    if current_user.guest?
      set_current_user(organization.guest)
    elsif !current_user.memberships.find(:organization => organization)
      current_user.memberships.create!(:organization => organization, :pending => false)
    end
    render :json => {
      :data => { :current_user_id => current_user_id },
      :records => build_client_dataset(current_user.initial_repository_contents)
    }
  end

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
