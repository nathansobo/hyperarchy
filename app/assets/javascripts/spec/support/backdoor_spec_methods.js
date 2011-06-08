function clearServerTables() {
  synchronously(function() {
    $.post('/backdoor/clear_tables');
  });
}

function usingBackdoor(callback) {
  synchronously(function() {
    var previousSandboxUrl = Server.sandboxUrl;
    Server.sandboxUrl = '/backdoor';
    callback();
    Server.sandboxUrl = previousSandboxUrl;
  });
  Repository.clear();
}

function synchronously(callback) {
  var previousAsyncSetting = jQuery.ajaxSettings.async;
  jQuery.ajaxSettings.async = false;
  callback();
  jQuery.ajaxSettings.async = previousAsyncSetting;
}
