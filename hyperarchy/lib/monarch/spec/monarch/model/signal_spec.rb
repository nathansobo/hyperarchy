require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Monarch
  module Model
    describe Signal do
      attr_reader :record, :transformer, :signal

      before do
        @record = User.find('jan')
        @transformer = lambda { |new_name| new_name + " the Great" }
        @signal = record.field(:full_name).signal(&transformer)
      end

      describe "#value" do
        it "returns the value returned by applying the transformer to the value of the underlying field" do
          signal.value.should == transformer.call(record.full_name)
        end
      end

      describe "when the value of the underlying field changes" do
        it "fires #on_update callbacks" do
          on_update_args = []
          signal.on_update do |new_value|
            on_update_args.push([new_value])
          end

          record.update(:full_name => "Loony Bun")

          on_update_args.should == [[transformer.call("Loony Bun")]]
        end
      end
    end
  end
end
