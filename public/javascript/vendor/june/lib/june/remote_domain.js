module("June", function(c) { with(c) {
  constructor("RemoteDomain", function() {
    def("initialize", function(url) {
      this.url = url;
    });


    def("create", function(set, attribute_values, create_callback) {
      jQuery.ajax({
        url: this.url,
        type: "POST",
        data: {
          set: set.global_name,
          attribute_values: JSON.stringify(attribute_values)
        },
        success: function(response) {
          response_json = JSON.parse(response);
          var tuple = set.local_create(response_json.attribute_values);
          create_callback(response_json.successful, tuple);
        }
      });
    });


    def("update", function(tuple, attribute_values, update_callback) {
      jQuery.ajax({
        url: this.url,
        type: "PUT",
        data: {
          tuple: JSON.stringify({ set: tuple.set.global_name, id: tuple.id() }),
          attribute_values: JSON.stringify(attribute_values)
        },
        success: function(response) {
          response_json = JSON.parse(response);
          tuple.local_update(response_json.attribute_values);
          update_callback(response_json.successful, tuple);
        }
      })
    });
    
    def("pull", function(relations, pull_callback) {
      var snapshot = this.fetch(relations, function(snapshot) {
        June.GlobalDomain.update(snapshot, pull_callback);
      });
    });

    def("fetch", function(relations, fetch_callback) {
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
          fetch_callback(JSON.parse(response));
        }
      });
    });
  });
}});