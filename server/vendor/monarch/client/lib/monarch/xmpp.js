//= require "xmpp/builder" 
//= require "xmpp/template" 

module("Xmpp", {
  build: function(content_fn) {
    return Xmpp.Template.build(content_fn);
  }
});
