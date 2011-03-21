require 'active_support/all'
require 'sequel'
require 'prequel/version'

module Prequel
  extend ActiveSupport::Autoload
  extend self

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

  def session
    Thread.current[:prequel_session] ||= Session.new
  end

  def clear_session
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
  autoload :Sandbox
  autoload :Session
  autoload :Sql
  autoload :Tuple
end
