module Services
  class Openfire < DaemonsService
    OPENFIRE_HOME = "/usr/local/openfire"
    OPENFIRE_LIB = "/usr/local/openfire/lib"
    JAVA_HOME = ENV['JAVA_HOME'] || "/System/Library/Frameworks/JavaVM.framework/Versions/1.6/Home"

    def app_name
      "openfire"
    end

    def proc
      lambda do
        exec "#{JAVA_HOME}/bin/java -server -DopenfireHome=#{OPENFIRE_HOME} -Dopenfire.lib.dir='#{OPENFIRE_LIB}' -classpath #{OPENFIRE_LIB}/startup.jar org.jivesoftware.openfire.starter.ServerStarter"
      end
    end
  end
end