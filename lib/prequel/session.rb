module Prequel
  class Session
    def initialize
      @identity_map = Hash.new {|h,k| h[k] = {}}
    end

    delegate :[], :[]=, :to => :identity_map

    protected
    attr_reader :identity_map
  end
end
