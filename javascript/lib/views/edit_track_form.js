module("Views", function(c) { with(c) {
  def("EditTrackForm", Prez.inherit(Prez.Form, {
    form_content: function(b) { with(b) {
      div({'id': "edit_track_form", 'class': "edit_form"}, function() {
        p(function() {
          label_for("name");
          br();
          input_for('name');
        });

        p(function() {
          label_for("maximum_users");
          br();
          input_for("maximum_users");
        });
      });
    }}
  }));
}});