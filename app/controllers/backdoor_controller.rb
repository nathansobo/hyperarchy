class BackdoorController < SandboxController
  protected

  def sandbox
    @sandbox ||= Prequel::Backdoor.new
  end
end
