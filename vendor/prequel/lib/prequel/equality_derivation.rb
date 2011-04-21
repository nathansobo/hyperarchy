module Prequel
  module EqualityDerivation
    def derive_equality(*attrs)
      define_method(:==) do |other|
        return false unless other.instance_of?(self.class)
        attrs.all? do |attr|
          send(attr) == other.send(attr)
        end
      end
    end
  end
end
