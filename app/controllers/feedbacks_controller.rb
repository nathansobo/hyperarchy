class FeedbacksController < ApplicationController
  def create
    feedback = params[:feedback]
    run_later do
      AdminMailer.feedback(current_user, feedback).deliver
    end
    head :ok
  end
end
