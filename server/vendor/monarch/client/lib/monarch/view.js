//= require "view/template"
//= require "view/builder"
//= require "view/open_tag"
//= require "view/close_tag"
//= require "view/self_closing_tag"
//= require "view/text_node"
//= require "view/jquery.monarch"
//= require "view/templates"

module("View", {
  build: function(content_fn) {
    return View.Template.build(content_fn);
  }
});
