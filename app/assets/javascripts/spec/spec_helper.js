//= require application
//= require_directory ./support


beforeEach(function() {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
  window.History.reset();
});

afterEach(function() {
  $('#jasmine_content').empty();
});