class RepositoryController < ApplicationController
  def fetch
    dataset = exposed_repository.fetch(params[:relations].from_json)
    render_success_json(nil, dataset)
  end

  def mutate
    successful, response_data = exposed_repository.mutate(params[:operations].from_json)
    render :json => {
      :successful => successful,
      :data => response_data,
    }
  end

  def exposed_repository
    @exposed_repository ||= ExposedRepository.new(current_user)
  end
end
