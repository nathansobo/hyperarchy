require 'spec_helper'

module Prequel
  describe Changeset do
    describe "#wire_representation" do
      it "returns only the new values, with times converted to epoch milliseconds" do
        class ::Blog < Prequel::Record
          column :id, :integer
          column :title, :string
          column :updated_at, :datetime

          create_table
        end

        blog = Blog.create


        freeze_time

        mock(blog).after_update(instance_of(Changeset)) do |changeset|
          changeset.wire_representation.should == {
            "title" => "New Title",
            "updated_at" => Time.now.to_millis
          }
        end

        blog.update!(:title => "New Title")
      end
    end
  end
end
