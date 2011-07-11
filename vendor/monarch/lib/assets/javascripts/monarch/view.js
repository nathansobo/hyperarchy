//= require monarch/view/template
//= require monarch/view/builder
//= require monarch/view/history
//= require monarch/view/open_tag
//= require monarch/view/close_tag
//= require monarch/view/self_closing_tag
//= require monarch/view/text_node

(function(Monarch) {

_.module("Monarch.View", {
  build: function(contentFn) {
    return Monarch.View.Template.build(contentFn);
  }
});

})(Monarch);
