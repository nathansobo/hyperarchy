module("June", function(c) { with(c) {
  constructor("RemoteDomain", function() {
    def("initialize", function(url) {
      this.url = url;
    });

    def("pull", function(relations, callback) {
      var snapshot = this.fetch(relations);
      June.GlobalDomain.update(snapshot, callback);
    });

    def("fetch", function() {
      var relation_wire_representations = June.map(arguments, function() {
        return this.wire_representation();
      });

      var response = jQuery.ajax({
        url: this.url,
        type: "GET",
        data: {
          relations: relation_wire_representations
        }
      });

      return JSON.parse(response);
    });
  });
}});