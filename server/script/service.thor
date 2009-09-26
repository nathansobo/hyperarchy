require File.expand_path("#{File.dirname(__FILE__)}/thor_helper")

class Service < Thor
  SERVICE_NAMES = %w(all app_server nginx openfire)

  def self.formatted_service_names
    "(" + SERVICE_NAMES.join("|") + ")"
  end

  desc "start #{formatted_service_names}", "Start a service"
  def start(service_name="all")
    verify_exists(service_name)
    if service_name == "all"
      all_services(:start)
      return
    end

    system "sudo ln -shf #{SERVER_ROOT}/service/#{service_name} /service/#{service_name}"
    system "sudo svc -u /service/#{service_name}"
    system "sudo svstat /service/#{service_name}"
  end

  desc "stop #{formatted_service_names}", "Stop a service"
  def stop(service_name="all")
    verify_exists(service_name)
    if service_name == "all"
      all_services(:stop)
      return
    end

    system "sudo svc -d /service/#{service_name}"
    system "sudo svstat /service/#{service_name}"
  end

  desc "restart #{formatted_service_names}", "Restart a service (only if it is running)"
  def restart(service_name="all")
    verify_exists(service_name)
    if service_name == "all"
      all_services(:restart)
      return
    end

    system "sudo svc -t /service/#{service_name}"
    system "sudo svstat /service/#{service_name}"
  end

  desc "status #{formatted_service_names}", "Print service status"
  def status(service_name="all")
    verify_exists(service_name)
    if service_name == "all"
      all_services(:status)
      return
    end

    system "sudo svstat /service/#{service_name}"
  end

  no_tasks do
    def verify_exists(service_name)
      raise "No service named #{service_name} exists" unless SERVICE_NAMES.include?(service_name)
    end

    def all_services(method)
      SERVICE_NAMES.reject {|name| name == 'all'}.each do |service_name|
        send(method, service_name)
      end
    end
  end
end
