class BackdoorController < SandboxController
  skip_around_filter :manage_session

  def create
    field_values = params[:field_values].blank?? {} : params[:field_values]
    blueprint_field_values = sandbox.get_relation(params[:relation]).tuple_class.plan(field_values).merge(field_values) # hack to keep foreign keys from being ignored by machinist
    params[:field_values] = blueprint_field_values
    super
  end

  def login
    user = params[:user_id] ? User.find(params[:user_id]) : User.make
    set_current_user(user)
    initial_repository_contents
  end

  def initial_repository_contents
    render :json => {
      :data => { :current_user_id => current_user_id },
      :records => build_client_dataset(current_user.initial_repository_contents)
    }
  end

  def create_multiple
    field_values = params[:field_values].blank?? {} : params[:field_values]
    record_class = sandbox.get_relation(params[:relation]).tuple_class

    records = []
    params[:count].to_i.times do |n|
      records.push(record_class.make(field_values))
    end

    render :json => build_client_dataset(records)
  end

  def clear_tables
    clear_current_user
    Prequel.clear_tables
    Sham.reset
    org = Organization.make(:id => 1, :name => "Hyperarchy Social", :suppress_membership_creation => true, :social => true, :privacy => "public")
    User.clear
    User.create!(:id => 1, :first_name => "Guest", :last_name => "User", :password => "password", :email_address => "guest@example.com", :default_guest => true, :guest => true)
    Membership.clear
    org.memberships.create!(:id => 1, :user_id => 1)
    head :ok
  end

  def upload_repository
    records = []

    records_by_table = JSON.parse(params[:records])
    records_by_table.each do |table_name, records_by_id|
      records_by_id.each do |id, field_values|
        field_values.symbolize_keys!
        record_class = table_name.to_s.singularize.camelize.constantize
        blueprint_field_values = record_class.plan(field_values).merge(field_values) # hack to keep foreign keys from being ignored by machinist


        if record = record_class.find(id)
          record.raw_update(blueprint_field_values)
          records << record
        else
          records << record_class.raw_create(blueprint_field_values)
        end
      end
    end

    render :json => build_client_dataset(records)
  end

  protected

  def sandbox
    @sandbox ||= Prequel::Backdoor.new
  end
end
