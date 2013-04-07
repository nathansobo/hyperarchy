class QuestionsController < ApplicationController
  def show
    id = params[:id]

    if id =~ /^[a-z]/

      puts "secret is #{id}"
      if QuestionPermission.find_or_create(:secret => id, :user_id => current_user_id)
        puts "question permission is found"
        question = current_user.private_questions.find(:secret => id)
      end
    else
      question = current_user.group_questions.find(id)
    end

    if question
      render :json => build_client_dataset(question.client_data)
    else
      render :status => 404, :text => "Question #{id} not found"
    end
  end
end
