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
    Pony.mail(default_options.merge(options))
  end
end

class FakeMailer < Mailer
  attr_reader :emails

  def initialize
    reset
  end

  def reset
    @emails = []
  end

  def send(options)
    emails.push(options)
  end
end