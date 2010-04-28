class User < Monarch::Model::Record
  column :full_name, :string
  column :age, :integer
  column :signed_up_at, :datetime
  column :has_hair, :boolean

  synthetic_column :great_name, :string do
    signal(:full_name) do |full_name|
      "#{full_name} The Great"
    end
  end

  synthetic_column :human, :boolean do
    signal(:full_name) do |full_name|
      true
    end
  end

  relates_to_many :blogs do
    Blog.where(Blog[:user_id].eq(id))
  end

  relates_to_many :blog_posts do
    blogs.join(BlogPost).on(BlogPost[:blog_id].eq(Blog[:id])).project(BlogPost)
  end

  def great_name=(full_name)
    self.full_name = full_name + " The Great"
  end

  def validate
    validation_error(:age, "User must be at least 10 years old") if age && age < 10
  end
end
