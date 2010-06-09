FIXTURES = {
  :users => {
    :nathan => {
      :first_name => "Nathan",
      :last_name => "Sobo",
      :email_address => "nathansobo@example.com",
      :encrypted_password => User.encrypt_password("password")
    }
  },

  :organizations => {
    :global => {
      :name => "Global"
    }
  },

  :elections => {
    :uses => {
      :organization_id => "global",
      :body => "What are some potential uses for Hyperarchy?"
    },
    :features => {
      :organization_id => "global",
      :body => "What features should Hyperarchy add next?"
    },
    :world_issue => {
      :organization_id => "global",
      :body => "What's the most important issue facing our world?"
    },
    :user_profiles => {
      :organization_id => "global",
      :body => "What information should appear on your profile page?"
    }
  },

  :candidates => {
    :workplace => {
      :election_id => "uses",
      :body => "In the workplace"
    },
    :classroom => {
      :election_id => "uses",
      :body => "In the classroom"
    },
    :town => {
      :election_id => "uses",
      :body => "In small towns"
    },
    :clubs => {
      :election_id => "uses",
      :body => "Clubs"
    },
    :tagging => {
      :election_id => "features",
      :body => "Tagging and Delegation"
    },
    :presence => {
      :election_id => "features",
      :body => "Presence notifications when others come online."
    },
    :presence => {
      :election_id => "features",
      :body => "User profiles"
    },
    :global_warming => {
      :election_id => "world_issue",
      :body => "Global warming"
    },
    :inequality => {
      :election_id => "world_issue",
      :body => "Inequality"
    },
    :healthy_food => {
      :election_id => "world_issue",
      :body => "Healthier food."
    },
    :voted_on => {
      :election_id => "user_profiles",
      :body => "Questions on which I have voted recently."
    },
    :avatar => {
      :election_id => "user_profiles",
      :body => "A picture of me"
    },
    :biography => {
      :election_id => "user_profiles",
      :body => "A short biography"
    }
  }
}
