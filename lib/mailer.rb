class Mailer
  class << self
    def instance
      @instance ||= new
    end

    def use_fake
      @instance = FakeMailer.new
    end

    delegate :send, :default_options=, :emails, :reset, :base_url=, :base_url, :to => :instance
    private :new
  end

  attr_accessor :default_options, :base_url
  def send(options)
    Pony.mail(process_options(options))
  end

  def process_options(options)
    options = (default_options || {}).merge(options)
    if erector_class = options[:erector_class]
      options[:html_body] = erector_class.new(options).to_html(:prettyprint => true)
    end
    options
  end
end

class FakeMailer < Mailer
  attr_reader :emails

  class << self
    public :new
  end

  def initialize
    reset
  end

  def reset
    @emails = []
  end

  def send(options)
    emails.push(process_options(options))
  end
end