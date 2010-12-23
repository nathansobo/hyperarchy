_.constructor("Views.DisconnectDialog", View.Template, {
  content: function() { with(this.builder) {
    div({id: "disconnectDialog", 'class': "dropShadow"}, function() {
      h1("Your connection to our server has been lost.");
      div("To ensure your interface stays up to date, you'll need to refresh the page.");

      a({id: "refresh", href: "#", 'class': "glossyBlack roundedButton"}, "Refresh").click('refresh');
      div({'class': 'clear'});
    });
  }},

  viewProperties: {
    initialize: function() {
      Server.realTimeClient.onDisconnect(function() {
        this.show();
      }, this);
    },

    beforeShow: function() {
      var background = $("#darkenBackground");
      background.one('click', this.hitch('refresh'));
      background.fadeIn('fast');
      this.position({
        my: 'center center',
        at: 'center center',
        of: background
      });
    },

    refresh: function() {
      window.location.reload();
      return false;
    }
  }
});