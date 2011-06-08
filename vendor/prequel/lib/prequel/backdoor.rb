module Prequel
  class Backdoor < Sandbox
    def get_relation(name)
      name.singularize.classify.constantize.try(:table)
    end

    def ignore_security?
      true
    end
  end
end
