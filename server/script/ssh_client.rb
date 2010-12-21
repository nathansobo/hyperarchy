$: << "#{HYPERARCHY_ROOT}/server/vendor/net-ssh-shell/lib"
require "net/ssh/shell"

class SshClient
  attr_reader :shell

  protected
  def shell
    @shell ||= Net::SSH.start("hyperarchy.com", "hyperarchy").shell
  end

  def execute!(*args)
    command = args.join(" ")
    puts command
    exit_status, output = shell.execute!(command)
    raise "#{command} executed non-zero" unless exit_status == 0
    output
  end

  def local(*args)
    command = args.join(" ")
    puts command
    system(command)
  end

  def self.commands(*commands)
    commands.each do |command|
      define_method(command) do |*args|
        execute!(command, *args)
      end
    end
  end

  commands :cd, :git, :bundle, :thor, :sudo, :touch, :rm, :source
end