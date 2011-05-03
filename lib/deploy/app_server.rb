require 'net/ssh'
require 'net/ssh/shell'

class AppServer
  def initialize(stage)
    @stage = stage
  end

  def provision
    run "ls -la /"
  end


  protected

  def hostname
    'rails.hyperarchy.com'
  end

  def shell
    @shell ||= Net::SSH.start(hostname, "root").shell
  end

  def run(command)
    puts command
    process = shell.execute(command)

    process.on_output do |output|
      puts output
    end

    process.on_error_output do |output|
      puts output
    end

    process.wait!
  end
end