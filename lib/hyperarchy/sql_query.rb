class SqlQuery
  attr_reader :from_sets, :conditions
  attr_writer :projected_set

  def initialize
    @from_sets = []
    @conditions = []
  end

  def to_sql
    "select #{projected_attributes_sql} from #{from_sets_sql}#{where_clause_sql};"
  end

  def where_clause_sql
    if conditions.empty?
      ""
    else
      " where #{conditions.map {|c| c.to_sql}.join(" and ")}"
    end
  end

  def projected_attributes_sql
    projected_set.attributes.map {|a| a.to_sql}.join(", ")
  end

  def from_sets_sql
    from_sets.map {|s| s.global_name}.join(", ")
  end

  def add_from_set(set)
    from_sets.push(set)
  end

  def add_condition(predicate)
    conditions.push(predicate)
  end

  def projected_set
    @projected_set || from_sets.first
  end
end