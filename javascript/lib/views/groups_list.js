module("Views", function(c) { with(c) {
  def("GroupsList", {
    content: function(b) { with(b) {
      ul({'id': "groups_list"});
    }},

    methods: {
      
    }
  });
}});