module Models
  class ExposedRepository < Monarch::Model::ExposedRepository
    attr_reader :user
    def initialize(user)
      @user = user
    end

    expose :organizations do
      user.organizations
    end

    expose :memberships do
      organizations.join_through(Membership)
    end

    expose :users do
      User.table
    end

    expose :elections do
      organizations.join_through(Election)
    end

    expose :candidates do
      elections.join_through(Candidate)
    end

    expose :rankings do
      elections.join_through(Ranking)
    end
  end
end
