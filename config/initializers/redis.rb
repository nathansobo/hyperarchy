$redis = Redis.new

if Rails.env.jasmine?
  def $redis.lock(name)
    puts "Stubbed lock acquisition: #{name}"
  end

  def $redis.unlock(name)
    puts "Stubbed lock release: #{name}"
  end
end
