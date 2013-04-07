class QuestionsController < ApplicationController
  def get
    id = params[:question_id]

    if id =~ /^[a-z]/
      question = Question.find(:secret => id)
    else
      question = Question.find(id)
    end

    render :json => build_client_dataset(question.client_data)
  end
end
