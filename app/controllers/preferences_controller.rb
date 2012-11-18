class PreferencesController < ApplicationController
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
end

