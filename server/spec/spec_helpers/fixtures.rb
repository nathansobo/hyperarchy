FIXTURES = {
  :users => {
    :nathan => {
      :full_name => "Nathan Sobo",
      :email_address => "nathansobo@example.com",
      :encrypted_password => User.encrypt_password("password")
    }
  },

  :organizations => {
    :meta => {
      :name => "Meta Hyperarchy"  
    },
    :restaurunt => {
      :name => "Restaurant"
    }
  },

  :elections => {
    :bottleneck => {
      :organization_id => "meta",
      :body => "What's our biggest bottleneck?"
    },
    :menu => {
      :organization_id => "restaurant",
      :body => "What should be on the menu?"  
    }
  }
}
