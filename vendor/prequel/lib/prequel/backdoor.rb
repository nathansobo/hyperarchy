module Prequel
  class Backdoor < Sandbox
    def get_relation(name)
      name.singularize.classify.constantize.try(:table)
    end
  end
end
