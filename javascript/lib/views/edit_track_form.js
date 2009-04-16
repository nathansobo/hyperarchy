module("Views", function(c) { with(c) {
  def("EditTrackForm", Prez.inherit(Prez.Form, {
    form_content: function(b) { with(b) {
      div({'id': "edit_track_form", 'class': "edit_form"}, function() {
        label_for("name");
        input_for('name');

        br();

        label_for("maximum_users");
        input_for("maximum_users");
      });
    }},

    methods: {
      foo: function() {
        console.debug("fooo");
      }
    }
  }));
}});