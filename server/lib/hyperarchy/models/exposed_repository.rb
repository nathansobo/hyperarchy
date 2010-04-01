module Models
  class ExposedRepository < Model::ExposedRepository
    attr_reader :user
    def initialize(user)
      @user = user
    end

    expose :organizations do
      Organization.table
    end

    expose :elections do
      Election.table
    end

    expose :candidates do
      Candidate.table
    end

    expose :rankings do
      Ranking.table
    end
  end
end
