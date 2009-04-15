module("Views", function(c) { with(c) {
  def("GroupsList", {
    content: function(b) { with(b) {
      ul({'id': "groups_list"});
    }},

    methods: {
      initialize: function() {
        this.remote_domain = June.remote("/domain");
      }
    }
  });
}});