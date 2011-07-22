//= require monarch
//= require monarch/add_to_global_namespace
//= require jquery-ui/jquery.ui.core
//= require jquery-ui/jquery.ui.position
//= require jquery-ui/jquery.ui.widget
//= require jquery-ui/jquery.ui.mouse
//= require jquery-ui/jquery.ui.draggable
//= require jquery-ui/jquery.ui.droppable
//= require jquery-ui/jquery.ui.sortable
//= require jquery-ui/jquery.ui.autocomplete
//= require jquery-ui/jquery.effects.core
//= require jquery-ui/jquery.effects.highlight
//= require jquery-ui/jquery.effects.scale
//= require jquery.elastic.source
//= require jquery.holdplace
//= require jquery.masonry
//= require jquery.phpdate
//= require jquery.caret
//= require jquery.tooltip.v.1.1
//= require jquery.hotkeys
//= require showdown
//= require jquery.markdown
//= require monarch_extensions
//= require socket.io
//= require history
//= require history.adaptor.jquery
//= require path
//= require models
//= require views
//= require routes

Server.sandboxUrl = "/sandbox";
//window.debugEvents = true;

$.fn.reverse = Array.prototype.reverse;

$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
  }
});
