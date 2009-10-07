require File.expand_path("#{File.dirname(__FILE__)}/thor_helper")


class Service < Thor
  desc "start (app_server | openfire | nginx | all) [--foreground]", "Start a service"
  method_options :foreground => false
  def start(service_name)
    service = locate_service(service_name)
    if options[:foreground]
      service.run
    else
      service.start
    end
  end

  desc "stop (app_server | openfire | nginx | all)", "Stop a service"
  def stop(service_name)
    service = locate_service(service_name)
    service.stop
  end

  protected
  def locate_service(name)
    require "#{File.dirname(__FILE__)}/../lib/services"
    Services.const_get(name.classify)
  end
end