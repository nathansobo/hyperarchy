class Domain
  class << self
    def instance
      @instance ||= new
    end

    delegate :new_set, :sets_by_name, :to => :instance 
  end

  attr_reader :sets_by_name
  def initialize
    @sets_by_name = {}
  end


  def new_set(name, tuple_class)
    sets_by_name[name] = Relations::Set.new(name, tuple_class)
  end
end