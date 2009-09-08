require File.expand_path("#{File.dirname(__FILE__)}/../../eden_spec_helper")

module Model
  describe Repository do
    describe "#build_relation_from_wire_representation" do
      it "resolves relation names to primitive Tables" do
        relation = Repository.instance.build_relation_from_wire_representation({
          "type" => "table",
          "name" => "blog_posts"
        })
        relation.should == BlogPost.table
      end
    end

    describe "#get" do
      it "parses the 'relations' paramater from a JSON string into an array of wire representations and performs a #fetch with it, returning the resulting snapshot as a JSON string" do
        relations = [{ "type" => "table", "name" => "blog_posts"}]

        snapshot = nil
        mock.proxy(Repository.instance).fetch(relations) {|result| snapshot = result}

        response = Repository.instance.get({"relations" => relations.to_json})

        response.should == [200, { 'Content-Type' => 'application/json'}, snapshot.to_json]
      end
    end

    describe "#locate" do
      it "returns the Table with the given #global_name" do
        Repository.instance.locate("groups").should == Repository.tables_by_name[:groups]
      end
    end

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
