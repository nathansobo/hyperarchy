require 'machinist/blueprints'

module Prequel
  class MachinistAdaptor
    class << self
      def has_association?(object, attribute)
        object.respond_to?(attribute) && object.send(attribute).is_a?(Relations::Relation)
      end

      def class_for_association(object, attribute)
        object.send(attribute).tuple_class
      end

      def assigned_attributes_without_associations(lathe)
        attributes = {}
        lathe.assigned_attributes.each_pair do |attribute, value|
          if has_association?(lathe.object, attribute)
            if lathe.object.respond_to?("#{attribute}_id=".to_sym)
              attributes["#{attributes}_id".to_sym] = value.id
            end
          else
            attributes[attribute] = value
          end
        end
        attributes
      end
    end
  end

  module MachinistRecordExtensions
    def make(*args, &block)
      lathe = Machinist::Lathe.run(MachinistAdaptor, self.new, *args)
      unless Machinist.nerfed?
        if lathe.object.valid?
          lathe.object.save
        else
          raise("Save failed: #{lathe.object.validation_errors.inspect}")
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
      lathe = Machinist::Lathe.run(MachinistAdaptor, self.new, *args)
      MachinistAdaptor.assigned_attributes_without_associations(lathe)
    end
  end

  module MachinistRelationMixin
    def make(*args, &block)
      lathe = Machinist::Lathe.run(MachinistAdaptor, self.new, *args)
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
      lathe = Machinist::Lathe.run(MachinistAdaptor, self.new, *args)
      MachinistAdaptor.assigned_attributes_without_associations(lathe)
    end
  end

  Record.extend(Machinist::Blueprints::ClassMethods)
  Record.extend(MachinistRecordExtensions)
  Relations::Relation.send(:include, MachinistRelationMixin)
end
