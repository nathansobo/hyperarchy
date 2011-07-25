class SharesController < ApplicationController
  def create
    Share.create!(params.slice(:code, :service, :question_id))
    head :ok
  end
end
