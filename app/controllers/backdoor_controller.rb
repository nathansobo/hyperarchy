class BackdoorController < SandboxController
  skip_around_filter :manage_session

  def create
    field_values = params[:field_values].blank?? {} : params[:field_values]
    blueprint_field_values = sandbox.get_relation(params[:relation]).tuple_class.plan(field_values)
    params[:field_values] = blueprint_field_values
    super
  end

  def login
    user = set_current_user(User.make)
    render :json => {
      :data => { :current_user_id => user.id },
      :records => build_client_dataset(user.initial_repository_contents)
    }
  end

  def initial_repository_contents
    render :json => build_client_dataset(current_user.initial_repository_contents)
  end

  def clear_tables
    Prequel.clear_tables
    Organization.make(:name => "Hyperarchy Social", :suppress_membership_creation => true, :social => true)
    User.make(:first_name => "Guest", :last_name => "User", :guest => true, :default_guest => true)
    head :ok
  end

  protected

  def sandbox
    @sandbox ||= Prequel::Backdoor.new
  end
end
