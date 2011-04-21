Sequel.migration do
  up do
    add_column :candidates, :created_at, Time
    add_column :candidates, :updated_at, Time
    add_column :invitations, :created_at, Time
    add_column :invitations, :updated_at, Time
    add_column :memberships, :created_at, Time
    add_column :memberships, :updated_at, Time
    add_column :organizations, :created_at, Time
    add_column :organizations, :updated_at, Time
    add_column :rankings, :created_at, Time
    add_column :rankings, :updated_at, Time
    add_column :users, :created_at, Time
    add_column :users, :updated_at, Time

    ## Attempting to give everything a somewhat reasonable time stamp to avoid null handling!

    # make candidates match the time of their election, but be 1 minute apart
    self[:elections].each do |election|
      candidates_query = "select * from candidates where election_id = #{election[:id]} order by id asc"
      time = election[:created_at]
      self[candidates_query].each do |candidate|
        time += 60
        self[:candidates].filter(:id => candidate[:id]).update(
          :created_at => time,
          :updated_at => time,
        )
      end
    end

    # make users match the time of their first vote or now if they never voted
    self[:users].each do |user|
      user_id = user[:id]
      oldest_vote = self[:votes].filter(:user_id => user_id).order(:created_at).limit(1).first
      time = oldest_vote ? oldest_vote[:created_at] : Time.now
      self[:users].filter(:id => user_id).update(:created_at => time, :updated_at => time)
    end

    # memberships match the time of the user
    self.execute(%{
      update memberships
      set created_at = users.created_at, updated_at = users.updated_at
      from users
      where memberships.user_id = users.id
    })

    # memberships that don't created_at / updated_at now because they don't have a user get marked with last_visited time
    self.execute(%{
      update memberships
      set created_at = last_visited, updated_at = last_visited
      where created_at is null or updated_at is null;
    })

    # make rankings match the time of the associated vote
    self.execute(%{
      update rankings
      set created_at = votes.created_at, updated_at = votes.created_at
      from votes
      where rankings.vote_id = votes.id
    })

    # make invitations default to their users created_at or now
    self.execute(%{
      update invitations set created_at = users.created_at, updated_at = users.created_at
      from users
      where invitations.invitee_id = users.id
    })
    self[:invitations].filter(:created_at => nil).update(:created_at => Time.now, :updated_at => Time.now)

    # make organizations default to the time of their first election or now
    self[:organizations].each do |organization|
      org_id = organization[:id]
      oldest_election = self[:elections].filter(:organization_id => org_id).order(:created_at).limit(1).first
      time = oldest_election ? oldest_election[:created_at] : Time.now
      self[:organizations].filter(:id => org_id).update(:created_at => time, :updated_at => time)
    end
  end

  down do
    drop_column :candidates, :created_at
    drop_column :candidates, :updated_at
    drop_column :invitations, :created_at
    drop_column :invitations, :updated_at
    drop_column :memberships, :created_at
    drop_column :memberships, :updated_at
    drop_column :organizations, :created_at
    drop_column :organizations, :updated_at
    drop_column :rankings, :created_at
    drop_column :rankings, :updated_at
    drop_column :users, :created_at
    drop_column :users, :updated_at
  end
end
