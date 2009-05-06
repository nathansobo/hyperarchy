module("June", function(c) { with(c) {
  constructor("RemoteDomain", function() {
    def("initialize", function(url) {
      this.url = url;
    });

    def("pull", function(relations, pull_callback) {
      var snapshot = this.fetch(relations, function(snapshot) {
        June.GlobalDomain.update(snapshot, pull_callback);
      });
    });

    def("fetch", function(relations, callback) {
      var relation_wire_representations = June.map(relations, function() {
        return this.wire_representation();
      });

      jQuery.ajax({
        url: this.url,
        type: "GET",
        data: {
          relations: JSON.stringify(relation_wire_representations)
        },
        success: function(response) {
          callback(JSON.parse(response));
        }
      });
    });
  });
}});