function clearServerTables() {
  synchronously(function() {
    $.post('/backdoor/clear_tables');
  });
}

function login() {
  return synchronously(function() {
    var currentUser;
    $.ajax({
      type: 'post',
      url: "/backdoor/login",
      dataType: 'data+records'
    }).success(function(data) {
      Application.currentUserId(data.current_user_id)
    });
    return Application.currentUser();
  });
}

function fetchInitialRepositoryContents() {
  synchronously(function() {
    $.ajax({
      type: 'get',
      url: "/backdoor/initial_repository_contents",
      dataType: 'records!'
    });
  });
}

function usingBackdoor(callback) {
  synchronously(function() {
    var previousSandboxUrl = Server.sandboxUrl;
    Server.sandboxUrl = '/backdoor';
    callback();
    Server.sandboxUrl = previousSandboxUrl;
  });
}

function synchronously(callback) {
  var previousAsyncSetting = jQuery.ajaxSettings.async;
  jQuery.ajaxSettings.async = false;
  var result = callback();
  jQuery.ajaxSettings.async = previousAsyncSetting;
  return result;
}
