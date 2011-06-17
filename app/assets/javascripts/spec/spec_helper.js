//= require application
//= require_directory ./support

var ajaxRequests;
var originalAjax = jQuery.ajax;
jQuery.ajax = function() {
  var jqXhr = originalAjax.apply(this, arguments);
  ajaxRequests.push(jqXhr);
  return jqXhr;
};

beforeEach(function() {
  ajaxRequests = [];
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
  window.History.reset();
  Repository.clear();
  stubAjax();
});

afterEach(function() {
  _.each(ajaxRequests, function(xhr) {
    xhr.abort();
  });
  ajaxRequests = [];
//  $('#jasmine_content').empty();
});

function attachLayout() {
  window.Application = Views.Layout.toView();
  Application.attach();
  Path.listen();
  return Application;
}

function renderLayout() {
  $("#jasmine_content").html(window.Application = Views.Layout.toView());
  Application.attach();
  Path.listen();
  return Application;
}

function stubAjax() {
  spyOn(jQuery, 'ajax').andCallFake(function() {
    var promise = jQuery.Deferred().promise();
    promise.success = promise.done;
    return promise;
  });
}

function enableAjax() {
  jQuery.ajax = jQuery.ajax.originalValue;
  clearServerTables();
}
