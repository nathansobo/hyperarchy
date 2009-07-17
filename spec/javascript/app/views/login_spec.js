//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.Login", function() {
    var view;
    before(function() {
      view = Views.Login.to_view();
    });

    describe("when #sign_up is clicked", function() {
      it("calls Application.navigate('signup')", function() {
        mock(Application, 'navigate');
        view.find('#sign_up').click();
        expect(Application.navigate).to(have_been_called, with_args('signup'));
      });
    });
  });
}});