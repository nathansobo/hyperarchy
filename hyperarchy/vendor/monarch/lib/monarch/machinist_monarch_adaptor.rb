require 'machinist/blueprints'

module Machinist
  class MonarchAdapter
    class << self
      def has_association?(object, attribute)
        object.class.relation_definitions.has_key?(attribute)
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

  module MonarchRecordExtensions
    def make(*args, &block)
      lathe = Lathe.run(Machinist::MonarchAdapter, self.new, *args)
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
      lathe = Lathe.run(Machinist::MonarchAdapter, self.new, *args)
      Machinist::MonarchAdapter.assigned_attributes_without_associations(lathe)
    end
  end

  module MonarchRelationMixin
    def make(*args, &block)
      lathe = Lathe.run(Machinist::MonarchAdapter, self.build, *args)
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
      lathe = Lathe.run(Machinist::MonarchAdapter, self.build, *args)
      Machinist::MonarchAdapter.assigned_attributes_without_associations(lathe)
    end
  end
end

Monarch::Model::Record.extend(Machinist::Blueprints::ClassMethods)
Monarch::Model::Record.extend(Machinist::MonarchRecordExtensions)
Monarch::Model::Relations::Relation.send(:include, Machinist::MonarchRelationMixin)