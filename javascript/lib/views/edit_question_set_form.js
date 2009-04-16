module("Views", function(c) { with(c) {
  def("EditQuestionSetForm", Prez.inherit(Prez.Form, {
    form_content: function(b) { with(b) {
      div({'id': "edit_question_set_form", 'class': "edit_form"}, function() {
        p(function() {
          label_for("name");
          br();
          input_for('name');
        });

        p(function() {
          label_for("info");
          br();
          input_for('info');
        });

        p(function() {
          label_for("explanation");
          br();
          input_for('explanation');
        });
      });
    }}
  }));
}});