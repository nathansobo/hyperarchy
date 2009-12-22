module Http
  class Subresource < Resource
    attr_reader :parent
    def initialize(parent, http_verb, parent_method)
      @parent = parent

      self.class_eval do
        define_method http_verb do |params|
          parent.send(parent_method, params)
        end
      end
    end
  end
end