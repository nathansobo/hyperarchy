module SpecMethods
  def time_travel_to(time)
    stub(Time).now { time }
  end

  def freeze_time
    time_travel_to(Time.now)
  end

  def jump(period)
    time_travel_to(Time.now + period)
  end

  def with_rails_env(env)
    previous, Rails.env = Rails.env, env
    yield
  ensure
    Rails.env = previous
  end

  def make_member(organization, attributes = {})
    user = User.make(attributes)
    organization.memberships.create!(:user => user, :suppress_invite_email => true)
    user
  end
end