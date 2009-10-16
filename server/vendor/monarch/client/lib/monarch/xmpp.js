(function(Monarch) {

//= require "xmpp/builder" 
//= require "xmpp/template" 

Monarch.module("Monarch.Xmpp", {
  build: function(content_fn) {
    return Monarch.Xmpp.Template.build(content_fn);
  }
});

})(Monarch);
