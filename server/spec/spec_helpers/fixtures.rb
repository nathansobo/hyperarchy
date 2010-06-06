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
    },
    :restaurant => {
      :name => "Restaurant"
    }
  },

  :elections => {
    :bottleneck => {
      :organization_id => "global",
      :body => "What's our biggest bottleneck?"
    },
    :menu => {
      :organization_id => "restaurant",
      :body => "What should be on the menu?"  
    }
  }
}
