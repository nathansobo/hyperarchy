require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Model
  describe RemoteRepository do
    describe "#insert" do
      it "performs a database insert into the table corresponding to the given Table with the given field values" do
        id = Guid.new.to_s

        dataset = Origin.connection[:blog_posts]
        dataset[:id => id].should be_nil

        field_values = {:id => id, :body => "Bulgar Wheat", :blog_id => "grain" }
        Origin.insert(BlogPost.table, field_values)

        retrieved_record = dataset[:id => id]
        retrieved_record[:id].should == field_values[:id]
        retrieved_record[:body].should == field_values[:body]
        retrieved_record[:blog_id].should == field_values[:blog_id]
      end
    end

    describe "#update" do
      it "performs a database update of the record in the table corresponding to the given Table based on the given field values" do
        dataset = Origin.connection[:blog_posts]

        field_values = dataset[:id => "grain_quinoa"]
        field_values[:body] = "QUINOA!!!"

        Origin.update(BlogPost.table, field_values)

        retrieved_record = dataset[:id => "grain_quinoa"]
        retrieved_record.should == field_values
      end
    end

    describe "#read" do
      context "when reading a Record that is in the identity map" do
        it "returns the instance of the Record from the identity map associated with the given Table instead of instantiating another" do
          record_in_id_map = BlogPost.find('grain_quinoa')
          BlogPost.table.identity_map['grain_quinoa'] = record_in_id_map

          records = Origin.read(BlogPost.where(BlogPost[:id].eq("grain_quinoa")))
          records.size.should == 1
          record = records.first
          record.should equal(record_in_id_map)
        end
      end

      context "when reading a Record that is not in the identity map" do
        it "instantiates instances of the given Table's #record_class with the field values returned by the query and inserts them into the identity map" do
          Origin.connection[:blog_posts].delete
          Origin.connection[:blog_posts] << { :id => "1", :body => "Quinoa" }
          Origin.connection[:blog_posts] << { :id => "2", :body => "Barley" }
          BlogPost.table.identity_map['1'].should be_nil
          BlogPost.table.identity_map['2'].should be_nil

          records = Origin.read(BlogPost.table)
          records.size.should == 2
          
          record_1 = records.find {|t| t.id == "1"}
          record_1.should_not be_dirty
          record_1.body.should == "Quinoa"
          BlogPost.table.identity_map['1'].should == record_1

          record_2 = records.find {|t| t.id == "2"}
          record_2.should_not be_dirty
          record_2.body.should == "Barley"
          BlogPost.table.identity_map['2'].should == record_2
        end
      end
    end
  end
end
