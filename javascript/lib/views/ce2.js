module("Views", function(c) { with(c) {
  def("CE2", {
    content: function(b) { with(b) {
      div(function() {
        subview("navigator", Views.Navigator);

//        subview("edit_track_form", Views.EditTrackForm);
      });




    }},

    methods: {
    }
  });
}});