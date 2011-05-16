module SpecMethods
  def time_travel_to(time)
    stub(Time).now { time }
    time
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
end