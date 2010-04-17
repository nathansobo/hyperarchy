FIXTURES = {
  :users => {
    :nathan => {
      :full_name => "Nathan Sobo",
      :email_address => "nathansobo@example.com",
      :encrypted_password => User.encrypt_password("password")
    }
  },

  :organizations => {
    :global => {
      :name => "Global"
    },
    :restaurunt => {
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
