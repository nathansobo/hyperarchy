class ElectionsController < ApplicationController
  def index
    organization = Organization.find(params[:organization_id])
    raise SecurityError unless organization.current_user_can_read?

    offset = params[:offset]
    limit = params[:limit]

    elections = organization.elections.offset(offset).limit(limit)
    election_creators = elections.join(User, :creator_id => User[:id])
    candidates = elections.join_through(Candidate).join(User, :creator_id => User[:id])
    visits = elections.join_through(current_user.election_visits)
    
    render :json => build_client_dataset(elections, election_creators, candidates, visits)
  end
end
