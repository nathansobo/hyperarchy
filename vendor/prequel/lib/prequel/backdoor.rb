module Prequel
  class Backdoor < Sandbox
    def get_relation(name)
      name.singularize.classify.constantize.try(:table)
    end


    def fetch(*wire_reps)
      (Hash.new {|h,k| h[k] = {}}).tap do |dataset|
        wire_reps.each do |wire_rep|
          evaluate(wire_rep).add_to_client_dataset(dataset, :ignore_security)
        end
      end
    end

  end
end
