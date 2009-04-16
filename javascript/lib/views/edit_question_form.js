module("Views", function(c) { with(c) {
  def("EditQuestionForm", Prez.inherit(Prez.Form, {
    form_content: function(b) { with(b) {
      div({'id': "edit_question_form", 'class': "edit_form"}, function() {
        p(function() {
          label_for("name");
          br();
          input_for('name');
        });

        p(function() {
          label_for("stimulus");
          br();
          input_for('stimulus');
        });

        p(function() {
          label_for("supporting_statements");
          br();
          input_for('supporting_statements');
        });

        p(function() {
          label_for("image");
          br();
          input_for('image');
        });

        p(function() {
          label_for("explanation");
          br();
          input_for('explanation');
        });

        p(function() {
          label_for("source_info");
          br();
          input_for('source_info');
        });
        
        p(function() {
          label_for("experience_points");
          br();
          input_for('experience_points');
        });
      });
    }}
  }));
}});