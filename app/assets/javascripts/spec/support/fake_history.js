window.History = {
  pushState: function(state, title, url) {
    var event = {
      state: state,
      url: this.getRootUrl() + url.replace(/^\//, '')
    };
    this.states.push(event)
    $(window).trigger('popstate', event);
  },

  getState: function() {
    return _.last(this.states);
  },

  getRootUrl: function() {
    return "http://test.hyperarchy.com:3000/";
  },

  getShortUrl: function(url) {
    // Trim rootUrl
    var shortUrl = url.replace(History.getRootUrl(),'/');
    // Clean It
    return shortUrl.replace(/^(\.\/)+/g,'./').replace(/\#$/,'');
  },

  reset: function() {
    this.states = [{
      state: {},
      url: this.getRootUrl()
    }];
  }
}