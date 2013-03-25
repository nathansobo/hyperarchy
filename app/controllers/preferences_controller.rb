class PreferencesController < ApplicationController
  before_filter :disallow_archived_questions

  def create
    attributes = { :user_id => current_user.id, :answer_id => params[:answer_id] }

    if preference = Preference.find(attributes)
      preference.update(:position => params[:position])
    else
      preference = Preference.create!(attributes.merge(:position => params[:position]))
    end

    render :json => {
      :data => {:preference_id => preference.id },
      :records => build_client_dataset(preference)
    }
  end

  def destroy
    preference = Preference.find(:user_id => current_user_id, :answer_id => params[:answer_id])
    preference.destroy()
    head :ok
  end

  def disallow_archived_questions
    question = Answer.find(params[:answer_id]).question
    if question.archived?
      render :status => :forbidden, :text => "Question #{question.id} is archived"
      false
    else
      true
    end
  end
end

