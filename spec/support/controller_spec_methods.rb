module ControllerSpecMethods
  def login_as(user)
    session[:current_user_id] = user.id
    user
  end

  def logout
    session[:current_user_id] = nil
  end

  def current_user_id
    controller.send(:current_user_id)
  end

  def current_user
    controller.send(:current_user)
  end

  def response_json
    @response_json ||= ActiveSupport::JSON.decode(response.body)
  end

  def response_records
    if response_json['records']
      records = response_json['records']
    else
      records = response_json
    end

    @response_records ||= RecordsWrapper.new(records)
  end

  class RecordsWrapper
    attr_reader :records_hash

    def initialize(records_hash)
      raise "There are no records in the response" unless records_hash
      @records_hash = records_hash
    end

    def include?(*records_or_relations)
      Array(records_or_relations).flatten.each do |record|
        table_name = record.table.name.to_s
        table_hash = records_hash[table_name]
        raise "Response records do not contain #{table_name} key" unless table_hash
        table_hash[record.to_param].should == record.wire_representation
      end
      true
    end
  end
end