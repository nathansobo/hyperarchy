(function(Monarch) {

//= require "view/template"
//= require "view/builder"
//= require "view/jquery.monarch"
//= require "view/templates"
//= require "view/history"
//= require "view/open_tag"
//= require "view/close_tag"
//= require "view/self_closing_tag"
//= require "view/text_node"


Monarch.module("Monarch.View", {
  build: function(contentFn) {
    return Monarch.View.Template.build(contentFn);
  }
});

})(Monarch);
