require 'active_support/all'
require 'sequel'
require 'prequel/version'

module Prequel
  extend ActiveSupport::Autoload
  extend self

  attr_accessor :test_mode

  def const_missing(name)
    if name == :DB
      const_set(:DB, Sequel::DATABASES.first)
    else
      super
    end
  end

  def table(name, &block)
    Relations::Table.new(name, &block)
  end

  def transaction(&block)
    Prequel.session.transaction_depth += 1
    result = nil
    DB.transaction do
      result = block.call
    end
    Prequel.session.flush_deferred_events
    result
  rescue Exception => e
    Prequel.session.clear_deferred_events if Prequel.session.transaction_depth == 1
    raise e unless Prequel.session.transaction_depth == 1 && e.instance_of?(Prequel::Rollback)
  ensure
    Prequel.session.transaction_depth -= 1
  end

  def session
    Thread.current[:prequel_session] ||= Session.new
  end

  def clear_session
    return if test_mode
    Thread.current[:prequel_session] = nil if Thread.current[:prequel_session]
  end

  def clear_session_in_test_mode
    raise "Prequel#clear_session_in_test_mode can only be called when test_mode=true" unless test_mode
    Thread.current[:prequel_session] = nil if Thread.current[:prequel_session]
  end

  def record_classes
    @record_classes ||= []
  end

  def clear_tables
    record_classes.each(&:clear)
  end

  require 'prequel/core_extensions'
  autoload :Changeset
  autoload :CompositeTuple
  autoload :Expressions
  autoload :EqualityDerivation
  autoload :Field
  autoload :Record
  autoload :Relations
  autoload :Rollback
  autoload :Sandbox
  autoload :Session
  autoload :SubscriptionNode
  autoload :Sql
  autoload :Tuple
end
