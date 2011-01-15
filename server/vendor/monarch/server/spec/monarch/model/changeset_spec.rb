require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Monarch
  module Model
    describe Changeset do
      describe "#wire_representation" do
        it "only includes authorized columns (on the read whitelist, not on the read blacklist)" do
          record = BlogPost.find("grain_quinoa")
          mock(record).read_whitelist { [:title, :body, :blog_id] }
          mock(record).read_blacklist { [:blog_id] }


          changeset = nil
          BlogPost.on_update do |blog, cs|
            changeset = cs
          end

          record.update!(:title => "New Title", :body => "New Body", :blog_id => 3, :featured => true)

          changeset.wire_representation.should == {
            "title" => "New Title",
            "body" => "New Body"
          }



        end
      end
    end
  end
end

