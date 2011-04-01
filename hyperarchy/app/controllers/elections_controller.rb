class ElectionsController < ApplicationController
  def index
    raise SecurityError unless current_user
    organization = Organization.find(params[:organization_id])
    raise SecurityError unless organization.current_user_can_read?

    offset = params[:offset]
    limit = params[:limit]

    elections = organization.elections.offset(offset).limit(limit)
    candidates = elections.join_through(Candidate).join(User, :creator_id => User[:id])
    visits = elections.join_through(current_user.election_visits)

    render_success_json(nil, [elections, candidates, visits])
  end
end
