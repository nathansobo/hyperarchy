module("Views", function(c) { with(c) {
  def("EditSubtrackForm", Prez.inherit(Prez.Form, {
    form_content: function(b) { with(b) {
      div({'id': "edit_subtrack_form", 'class': "edit_form"}, function() {
        p(function() {
          label_for("name");
          br();
          input_for('name');
        });

        p(function() {
          label_for("answer_mode_timeout");
          br();
          input_for('answer_mode_timeout');
        });

        p(function() {
          label_for("review_mode_timeout");
          br();
          input_for('review_mode_timeout');
        });
      });
    }}
  }));
}});