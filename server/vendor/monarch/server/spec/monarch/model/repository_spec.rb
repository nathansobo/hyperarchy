require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Model
  describe Repository do
    describe "#initialize_identity_maps" do
      after do
        # verify doubles before the global after clears the identity map, causing an unexpected invocation
        RR::verify_doubles
      end

      it "calls #initialize_identity_map on every Table" do
        Repository.tables.each do |table|
          mock(table).initialize_identity_map
        end
        Repository.initialize_identity_maps
      end
    end

    describe "#clear_identity_maps" do
      after do
        # verify doubles before the global after clears the identity map, causing an unexpected invocation
        RR::verify_doubles
      end

      it "calls #clear_identity_map on every Table" do
        Repository.tables.each do |table|
          mock(table).clear_identity_map
        end
        Repository.clear_identity_maps
      end
    end
  end
end
