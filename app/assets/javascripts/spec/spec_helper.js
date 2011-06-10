//= require application
//= require_directory ./support


beforeEach(function() {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
  window.History.reset();
  Repository.clear();
});

afterEach(function() {
  $('#jasmine_content').empty();
});

function attachLayout() {
  window.Application = Views.Layout.toView();
  Application.attach();
  return Application;
}

function renderLayout() {
  $("#jasmine_content").html(window.Application = Views.Layout.toView());
  Application.attach();
  return Application;
}

function stubAjax() {
  spyOn(jQuery, 'ajax').andCallFake(function() {
    var promise = jQuery.Deferred().promise();
    promise.success = promise.done;
    return promise;
  });
}