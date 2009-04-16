module("Views", function(c) { with(c) {
  def("CE2", {
    content: function(b) { with(b) {
      div(function() {
        subview("navigator", Views.Navigator);
        subview("edit_track_form", Views.EditTrackForm);
        subview("edit_subtrack_form", Views.EditSubtrackForm);
        subview("edit_question_set_form", Views.EditQuestionSetForm);
        subview("edit_question_form", Views.EditQuestionForm);
      });
    }},

    methods: {
      initialize: function() {
        var self = this;
        this.navigator.on_track_selected(function(track) {
          self.load_and_show_form(self.edit_track_form, track);
        });
        this.navigator.on_subtrack_selected(function(subtrack) {
          self.load_and_show_form(self.edit_subtrack_form, subtrack);
        });
        this.navigator.on_question_set_selected(function(question_set) {
          self.load_and_show_form(self.edit_question_set_form, question_set);
        });
        this.navigator.on_question_selected(function(question) {
          self.load_and_show_form(self.edit_question_form, question);
        });
      },

      load_and_show_form: function(form, model) {
        this.find(".edit_form").hide();
        form.model = model;
        form.load();
        form.show();
      }
    }
  });
}});