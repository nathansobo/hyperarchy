module Warden
  module Strategies
    class BcryptStrategy < Base
      def valid?
        params["email_address"] || params["password"]
      end

      def authenticate!
        unless user = User.find(:email_address => params["email_address"])
          errors.add(:email_address, "No user found with that email address.")
          fail!
          return
        end

        if user.password == params["password"]
          success!(user)
        else
          errors.add(:password, "Incorrect password.")
          fail!
        end
      end
    end

    add(:bcrypt, BcryptStrategy)
  end
end