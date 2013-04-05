require 'spec_helper'

module Models
  describe User do
    let(:user) { User.make! }

    describe ".from_omniauth(auth_data)" do
      describe "when the user authenticates with Google OAuth2" do
        describe "when the user has a standard Google account" do
          it "does not create a group for them" do
            user = User.from_omniauth(standard_google_user_creds)
            user.full_name.should == "Bob Smith"
            user.email_address.should == "bob@gmail.com"
            user.uid.should == "12345"
            user.memberships.should be_empty
          end
        end

        describe "when the user has an Apps for Domains account" do
          it "creates a group for that domain if one does not exist already and makes them a member" do
            user = User.from_omniauth(apps_google_user_creds)
            user.memberships.count.should == 1
            user.groups.first.domain.should == "acme.com"
            user.groups.first.name.should == "acme.com"
          end
        end
      end
    end

    describe "security" do
      describe "#can_update? and #can_destroy?" do
        it "only the users themselves to update / destroy user records" do
          other_user = User.make!

          set_current_user(other_user)
          user.can_update?.should be_false
          user.can_destroy?.should be_false

          set_current_user(user)
          user.can_update?.should be_true
          user.can_destroy?.should be_true
        end
      end
    end

    let :standard_google_user_creds do
      Hashie::Mash.new({"provider"=>"google_oauth2",
       "uid"=>"12345",
       "info"=>
        {"name"=>"Bob Smith",
         "email"=>"bob@gmail.com",
         "first_name"=>"Bob",
         "last_name"=>"Smith",
         "image"=>
          "https://lh3.googleusercontent.com/-SE_y_kIv-Fc/AAAAAAAAAAI/AAAAAAAAAEc/DYjl78_QFew/photo.jpg"},
       "credentials"=>
        {"token"=>"token",
         "refresh_token"=>"refresh_token",
         "expires_at"=>1.day.from_now.to_millis,
         "expires"=>true},
       "extra"=>
        {"raw_info"=>
          {"id"=>"12345",
           "email"=>"bob@gmail.com",
           "verified_email"=>true,
           "name"=>"Bob Smith",
           "given_name"=>"Bob",
           "family_name"=>"Smith",
           "link"=>"https://plus.google.com/12345",
           "picture"=>
            "https://lh3.googleusercontent.com/-SE_y_kIv-Fc/AAAAAAAAAAI/AAAAAAAAAEc/DYjl78_QFew/photo.jpg",
           "gender"=>"male",
           "locale"=>"en"}}})
    end

    let :apps_google_user_creds do
      Hashie::Mash.new({"provider"=>"google_oauth2",
       "uid"=>"54321",
       "info"=>
        {"name"=>"John Doe",
         "email"=>"john@acme.com",
         "first_name"=>"John",
         "last_name"=>"Doe"},
       "credentials"=>
        {"token"=>"token",
         "refresh_token"=>"refesh_token",
         "expires_at"=>1.day.from_now.to_millis,
         "expires"=>true},
       "extra"=>
        {"raw_info"=>
          {"id"=>"54321",
           "email"=>"john@acme.com",
           "verified_email"=>true,
           "name"=>"John Doe",
           "given_name"=>"John",
           "family_name"=>"Doe",
           "link"=>"https://plus.google.com/54321",
           "gender"=>"male",
           "birthday"=>"0000-01-25",
           "locale"=>"en",
           "hd"=>"acme.com"}}})
    end
  end
end
