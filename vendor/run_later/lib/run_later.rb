require 'run_later/worker'
require 'run_later/instance_methods'
require 'run_later/cleanup'

module RunLater
  require 'run_later/railtie' if defined?(Rails)
end

ActionController::Base.send(:include, RunLater::InstanceMethods)

# Hacked this out because we don't run AR
## Make run_later available both as instance and class methods
#ActiveRecord::Base.send(:include, RunLater::InstanceMethods)
#ActiveRecord::Base.extend(RunLater::InstanceMethods)
#ActiveRecord::Observer.send(:include, RunLater::InstanceMethods)
#ActiveRecord::Observer.extend(RunLater::InstanceMethods)