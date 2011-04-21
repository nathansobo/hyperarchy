require 'machinist/blueprints'

module Prequel
  class MachinistAdaptor
    class << self
      def has_association?(object, attribute)
        object.respond_to?("#{attribute}_id")
      end

      def class_for_association(object, attribute)
        object.send(attribute).tuple_class
      end

      def assigned_attributes_without_associations(lathe)
        attributes = {}
        lathe.assigned_attributes.each_pair do |attribute, value|
          if has_association?(lathe.object, attribute)
            if lathe.object.respond_to?("#{attribute}_id=".to_sym)
              attributes["#{attribute}_id".to_sym] = value.id
            end
          else
            attributes[attribute] = value
          end
        end
        attributes
      end
    end
  end

  Record.extend(Machinist::Blueprints::ClassMethods)

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

    Record.extend(self)
  end

  module MachinistSelectionMixin
    def make(attributes={})
      operand.make(predicate.enhance_attributes(attributes))
    end

    def make_unsaved(attributes={})
      operand.make_unsaved(predicate.enhance_attributes(attributes))
    end

    def plan(attributes={})
      operand.plan(predicate.enhance_attributes(attributes))
    end

    Relations::Selection.send(:include, MachinistSelectionMixin)
  end

  module MachinistTableMixin
    delegate :make, :make_unsaved, :plan, :to => :tuple_class

    Relations::Table.send(:include, MachinistTableMixin)
  end

  module MachinistRelationMixin
    delegate :make, :make_unsaved, :plan, :to => :operand

    Relations::Relation.send(:include, MachinistRelationMixin)
  end
end
