//= require application
//= require_directory ./support


beforeEach(function() {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
  window.History.reset();
});

afterEach(function() {
  $('#jasmine_content').empty();
});

function attachLayout() {
  $("#jasmine_content").html(window.Application = Views.Layout.toView());
  Application.attach();
  return Application;
}