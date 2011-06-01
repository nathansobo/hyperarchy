class FeedbacksController < ApplicationController

  def create
    AdminMailer.feedback(current_user, params[:feedback]).deliver
    head :ok
  end
end
