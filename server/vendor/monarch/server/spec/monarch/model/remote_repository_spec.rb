require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Monarch
  module Model
    describe RemoteRepository do
      describe "#insert(table, field_values)" do
        it "performs a database insert into the table corresponding to the given Table with the given field values and returns the id of the inserted record" do
          field_values = {:body => "Bulgar Wheat", :blog_id => "grain".hash }
          id = Origin.insert(BlogPost.table, field_values)
          dataset = Origin.connection[:blog_posts]
          retrieved_record = dataset[:id => id]
          retrieved_record[:body].should == field_values[:body]
          retrieved_record[:blog_id].should == field_values[:blog_id]
        end
      end

      describe "#update(table, field_values)" do
        it "performs a database update of the record in the table corresponding to the given Table based on the given field values" do
          dataset = Origin.connection[:blog_posts]

          field_values = dataset[:id => "grain_quinoa".hash]
          field_values[:body] = "QUINOA!!!"

          Origin.update(BlogPost.table, 'grain_quinoa'.hash, field_values)

          retrieved_record = dataset[:id => "grain_quinoa".hash]
          retrieved_record.should == field_values
        end
      end

      describe "#destroy(table, id)" do
        it "deletes the indicated record in the database" do
          dataset = Origin.connection[:blog_posts]
          dataset[:id => "grain_quinoa".hash].should_not be_nil

          Origin.destroy(BlogPost.table, "grain_quinoa".hash)

          dataset[:id => "grain_quinoa".hash].should be_nil
        end
      end

      describe "#read" do
        context "when reading a Record that is in the identity map" do
          it "returns the instance of the Record from the identity map associated with the given Table instead of instantiating another, ensuring it is current with the field values just retrieved from the database" do
            record_in_id_map = BlogPost.find('grain_quinoa')
            BlogPost.table.local_identity_map['grain_quinoa'] = record_in_id_map

            Origin.execute_dui("update blog_posts set body = 'New Body' where id = #{record_in_id_map.id}")

            all = Origin.read(BlogPost.where(BlogPost[:id].eq("grain_quinoa")))
            all.size.should == 1
            record = all.first
            record.should equal(record_in_id_map)
            record.body.should == "New Body"
          end
        end

        context "when reading a Record that is not in the identity map" do
          it "instantiates instances of the given Table's #tuple_class with the field values returned by the query and inserts them into the identity map" do
            Origin.connection[:blog_posts].delete
            Origin.connection[:blog_posts] << { :id => 1, :body => "Quinoa" }
            Origin.connection[:blog_posts] << { :id => 2, :body => "Barley" }
            BlogPost.table.local_identity_map['1'].should be_nil
            BlogPost.table.local_identity_map['2'].should be_nil

            all = Origin.read(BlogPost.table)
            all.size.should == 2

            record_1 = all.find {|t| t.id == 1}
            record_1.should_not be_dirty
            record_1.body.should == "Quinoa"
            BlogPost.table.local_identity_map[1].should == record_1

            record_2 = all.find {|t| t.id == 2}
            record_2.should_not be_dirty
            record_2.body.should == "Barley"
            BlogPost.table.local_identity_map[2].should == record_2
          end
        end
      end
    end
  end
end
