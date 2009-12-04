(function(Monarch) {

Monarch.constructor("Monarch.Http.CometClient", {
  connect: function() {
    var self = this;
    var len = 0
    session_id = Math.uuid(12);

    var xhr = jQuery.ajax({
      type: "post",
      url: "/comet",
      data: { session_id: session_id, transport: "xhr_stream" },
      complete: function() { self.connect() }
    });

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 3) {
        var data = xhr.responseText.slice(len).strip();
        len = xhr.responseText.length;
        if (data.length > 0) console.debug(data);
      }
    }
  }
});

})(Monarch);
