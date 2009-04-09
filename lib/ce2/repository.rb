class Repository
  attr_accessor :connection

  def insert(table_name, attributes)
    connection.from(table_name).insert(attributes)
  end

  def read(tuple_class, query)
    connection[query].map do |field_values|
      tuple_class.unsafe_new(field_values)
    end
  end

  def create_schema
    create_table :answers do
      column :id, :string
      column :name, :string
      column :body, :string
      column :explanation, :string
      column :question_id, :string
      column :correct, :boolean
      column :position, :integer
      column :deleted_at, :datetime
    end
    create_table :questions do
      column :stimulus, :string
      column :position, :integer
      column :supporting_statements, :string
      column :image, :string
      column :question_set_id, :string
      column :explanation, :string
      column :name, :string
      column :source_info, :string
      column :experience_points, :integer
      column :deleted_at, :datetime
      column :published_at, :datetime
      column :spr, :boolean
    end
  end

  def create_table(name, &definition)
    connection.create_table(name, &definition)
  end

  #TODO: test
  def clear_table(name)
    connection[name].delete
  end
end