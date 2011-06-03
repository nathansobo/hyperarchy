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

  def clear_deliveries
    ActionMailer::Base.deliveries.clear
  end

  def last_delivery
    ActionMailer::Base.deliveries.first
  end

  def expect_delivery(&block)
    result = nil
    expect do
      result = block.call
    end.to change(ActionMailer::Base.deliveries, :length).by(1)
    result
  end
end