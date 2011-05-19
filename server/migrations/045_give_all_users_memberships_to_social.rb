Sequel.migration do
  up do
    social_org = self[:organizations].filter(:social => true).first

    users_with_no_social_membership = fetch(%{
      select users.*
      from users
      left outer join memberships
        on memberships.user_id = users.id
           and memberships.organization_id = #{social_org[:id]}
      where memberships.id is null;
    })

    users_with_no_social_membership.each do |user|
      puts "#{user[:first_name]} #{user[:last_name]}"

      self[:memberships] << {
        :user_id => user[:id],
        :organization_id => social_org[:id],
        :role => 'member',
        :notify_of_new_elections => 'never',
        :notify_of_new_candidates => 'never',
        :notify_of_new_comments_on_own_candidates => 'never',
        :notify_of_new_comments_on_ranked_candidates => 'never',
        :has_participated => false,
        :pending => false,
        :created_at => Time.now,
        :updated_at => Time.now,
        :last_visited => Time.now - (525600 * 60)
      }
    end
  end
end

