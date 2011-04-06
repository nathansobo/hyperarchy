(function(Monarch, jQuery) {

_.constructor("Monarch.Http.Server", {
  sandboxUrl: '/sandbox',

  fetch: function() {
    var relationWireRepresentations = _.map(arguments, function(arg) {
      return arg.wireRepresentation();
    });

    var promise = new Monarch.Promise();

    jQuery.ajax({
      url: this.sandboxUrl,
      type: 'get',
      data: { relations: JSON.stringify(relationWireRepresentations) },
      success: function(records) {
        Repository.update(records);
        promise.triggerSuccess();
      },
      error: function(jqXhr, textStatus, errorThrown) {
        promise.triggerError(jqXhr, textStatus, errorThrown);
      }
    });

    return promise;
  }
});

})(Monarch, jQuery);
