module Views
  class SentPasswordResetToken < FloatingCard
    def floating_card_content
      div "An email has been sent to the address you provided. Please open it and follow the instructions to reset your password"
    end
  end
end