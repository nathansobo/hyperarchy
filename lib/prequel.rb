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

  require 'prequel/core_extensions'
  autoload :CompositeTuple
  autoload :Expressions
  autoload :Field
  autoload :Record
  autoload :Relations
  autoload :Session
  autoload :Sql
  autoload :Tuple
end
