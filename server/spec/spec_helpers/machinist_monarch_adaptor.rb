module Machinist
  class MonarchAdapter
    class << self
      def has_association?(object, attribute)
        object.class.relation_definitions.has_key?(attribute)
      end

      def class_for_association(object, attribute)
        object.send(attribute).tuple_class
      end
    end
  end

  module MonarchRecordExtensions
    def make(*args, &block)
      lathe = Lathe.run(Machinist::MonarchAdapter, self.new, *args)
      unless Machinist.nerfed?
        if lathe.object.valid?
          lathe.object.save
        else
          raise("Save failed")
        end
      end
      lathe.object(&block)
    end

    def make_unsaved(*args)
      object = Machinist.with_save_nerfed { make(*args) }
      yield object if block_given?
      object
    end


    def plan(*args)
      raise "Not implemented"
    end
  end
end

Monarch::Model::Record.extend(Machinist::Blueprints::ClassMethods)
Monarch::Model::Record.extend(Machinist::MonarchRecordExtensions)