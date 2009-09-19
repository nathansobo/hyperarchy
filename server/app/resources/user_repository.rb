module Resources
  class UserRepository < Model::ExposedRepository
    attr_reader :user
    def initialize(user)
      @user = user
    end

    expose :organizations do
      Organization.table
    end
  end
end
