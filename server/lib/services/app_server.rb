module Services
  class AppServer < DaemonsService
    def app_name
      "app_server"
    end

    def proc
      lambda do
        exec "#{File.dirname(__FILE__)}/../../script/server"
      end
    end
  end
end
