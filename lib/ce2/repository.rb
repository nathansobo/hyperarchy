class Repository
  attr_accessor :connection

  def insert(table_name, attributes)
    connection.from(table_name).insert(attributes)
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
  end

  def create_table(name, &definition)
    connection.create_table(name, &definition)
  end
end