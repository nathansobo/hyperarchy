(function(Monarch) {

//= require "xmpp/builder" 
//= require "xmpp/template" 
//= require "xmpp/server" 
//= require "xmpp/presence" 

Monarch.module("Monarch.Xmpp", {
  build: function(content_fn) {
    return Monarch.Xmpp.Template.build(content_fn);
  }
});

})(Monarch);
