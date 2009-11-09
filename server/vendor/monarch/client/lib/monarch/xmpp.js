(function(Monarch) {

//= require "xmpp/open_tag" 
//= require "xmpp/builder"
//= require "xmpp/template"
//= require "xmpp/server" 
//= require "xmpp/templates" 

Monarch.module("Monarch.Xmpp", {
  build: function(content_fn) {
    return Monarch.Xmpp.Template.build(content_fn);
  }
});

})(Monarch);
