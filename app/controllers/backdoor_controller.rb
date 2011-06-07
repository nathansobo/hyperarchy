class BackdoorController < SandboxController
  skip_around_filter :manage_session
  
  def create
    load Rails.root.join('spec/support/blueprints.rb') if Rails.env.jasmine?
    field_values = params[:field_values].blank?? {} : params[:field_values]
    blueprint_field_values = sandbox.get_relation(params[:relation]).tuple_class.plan(field_values)
    params[:field_values] = blueprint_field_values
    super
  end

  def clear_tables
    Prequel.clear_tables
    head :ok
  end

  protected

  def sandbox
    @sandbox ||= Prequel::Backdoor.new
  end
end
