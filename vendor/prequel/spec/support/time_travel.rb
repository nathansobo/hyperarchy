module TimeTravel
  def time_travel_to(time)
    stub(Time).now { time }
  end

  def freeze_time
    time_travel_to(Time.now)
  end

  def jump(period)
    time_travel_to(Time.now + period)
  end
end