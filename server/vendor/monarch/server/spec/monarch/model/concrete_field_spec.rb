require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Model
  describe ConcreteField do
    attr_reader :field

    def field
      @field ||= BlogPost.new.field(:body)
    end

    def datetime_field
      @field ||= User.find('jan').field(:signed_up_at)
    end

    def boolean_field
      @field ||= User.find('jan').field(:has_hair)
    end

    describe "#value=" do
      context "when assigning to a :datetime field" do
        def field
          datetime_field
        end

        context "when assigning an integer" do
          it "interprets the integer as milliseconds since the epoch and converts it to a Time" do
            time = Time.now
            millis = time.to_i * 1000
            field.value = millis
            field.value.should be_an_instance_of(Time)
            field.value.to_i.should == time.to_i
          end
        end

        context "when assigning a Time" do
          it "just assigns the Time without converting it" do
            time = Time.now
            field.value = time
            field.value.should be_an_instance_of(Time)
            field.value.should == time
          end
        end
      end

      context "when assigning to a boolean field" do
        def field
          boolean_field
        end

        it "interprets 'f', 0, and false as false and 't', 1, and true as true" do
          field.value = 'f'
          field.value.should be_false
          field.value = 't'
          field.value.should be_true
          field.value = 0
          field.value.should be_false
          field.value = 1
          field.value.should be_true
          field.value = false
          field.value.should be_false
          field.value = true
          field.value.should be_true
        end
      end

      it "sets #value to the result of #column.convert_value_for_storage on the given value" do
        mock(field.column).convert_value_for_storage("foo") { "bar" }
        field.value=("foo")
        field.value.should == "bar"
      end

      it "sets #dirty? to true if the value changed and leaves it false if it did not change" do
        field.value = "adroit"
        field.should be_dirty
        field.mark_clean
        field.value = "adroit"
        field.should_not be_dirty

        time = Time.now
        datetime_field.value = time
        field.should be_dirty
        field.mark_clean
        datetime_field.value = time
        field.should_not be_dirty
      end

      it "triggers #on_update callbacks" do
        callback_args = []
        field.on_update do |new_value|
          callback_args.push([new_value])
        end

        field.value = "BAAM"

        callback_args.should == [["BAAM"]]
      end
    end

    describe "#value_wire_representation" do
      context "when the column's #type is :datetime" do
        def field
          datetime_field
        end

        it "returns the #value converted to milliseconds since the epoch" do
          field.value_wire_representation.should == field.value.to_millis
        end
      end

      context "when the column's #type is not :datetime" do
        it "just returns the #value" do

        end
      end
    end

    describe "#where_clause_sql" do
      it "proxies to #value" do
        field.value = "hello"
        field.where_clause_sql.should == field.value.where_clause_sql
      end
    end
  end
end
