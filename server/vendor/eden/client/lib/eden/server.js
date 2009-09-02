module("Server", {
  post: function(url, data) {
    var future = new AjaxFuture();
    jQuery.ajax({
      url: url,
      type: 'POST',
      dataType: 'json',
      data: data,
      success: function(response) {
        future.handle_response(response);
      }
    });
    return future;
  }
});