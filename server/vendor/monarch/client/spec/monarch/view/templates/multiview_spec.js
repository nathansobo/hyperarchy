//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("View.Templates.Multiview", function() {
    before(function() {
      ModuleSystem.constructor("Template1", View.Template, {
        content: function() {
          this.builder.div({id: "template_1"});
        }
      });

      ModuleSystem.constructor("Template2", View.Template, {
        content: function() {
          this.builder.div({id: "template_2"});
        }
      });

      view = View.Templates.Multiview.to_view({
        view_1: Template1,
        view_2: Template2
      });
    });

    after(function() {
      delete window.Template1;
      delete window.Template2;
    });

    describe("rendering and initialization", function() {
      it("renders all the given templates as subviews, storing references to them inside a 'subviews' collection and also directly on the multiview", function() {
        expect(view.find("#template_1")).to_not(be_empty);
        expect(view.find("#template_2")).to_not(be_empty);

        expect(view.subviews.view_1.attr('id')).to(equal, "template_1");
        expect(view.subviews.view_2.attr('id')).to(equal, "template_2");
        expect(view.view_1).to(equal, view.subviews.view_1);
        expect(view.view_2).to(equal, view.subviews.view_2);
      });
    });

    describe("#hide_all_except", function() {
      it("hides all subviews except the one with the given name", function() {
        mock(view.view_1, 'show');
        mock(view.view_2, 'hide');

        view.hide_all_except('view_1');
        
        expect(view.view_1.show).to(have_been_called, once);
        expect(view.view_2.hide).to(have_been_called, once);
      });
    });
  });
}});
