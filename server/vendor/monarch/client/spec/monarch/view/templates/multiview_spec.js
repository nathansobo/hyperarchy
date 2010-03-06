//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.View.Templates.Multiview", function() {
    before(function() {
      Monarch.ModuleSystem.constructor("Template1", Monarch.View.Template, {
        content: function() {
          this.builder.div({id: "template1"});
        }
      });

      Monarch.ModuleSystem.constructor("Template2", Monarch.View.Template, {
        content: function() {
          this.builder.div({id: "template2"});
        }
      });

      Monarch.ModuleSystem.constructor("Template3", Monarch.View.Template, {
        content: function() {
          this.builder.div({id: "template3"});
        }
      });

      view = Monarch.View.Templates.Multiview.toView({
        view1: Template1,
        view2: Template2,
        view3: Template3
      });
    });

    after(function() {
      delete window.Template1;
      delete window.Template2;
      delete window.Template3;
    });

    describe("rendering and initialization", function() {
      it("renders all the given templates as subviews, storing references to them inside a 'subviews' collection and also directly on the multiview", function() {
        expect(view.find("#template1")).toNot(beEmpty);
        expect(view.find("#template2")).toNot(beEmpty);
        expect(view.find("#template3")).toNot(beEmpty);

        expect(view.subviews.view1.attr('id')).to(equal, "template1");
        expect(view.subviews.view2.attr('id')).to(equal, "template2");
        expect(view.subviews.view3.attr('id')).to(equal, "template3");
        expect(view.view1).to(equal, view.subviews.view1);
        expect(view.view2).to(equal, view.subviews.view2);
        expect(view.view3).to(equal, view.subviews.view3);
      });
    });

    describe("#hideAllExcept", function() {
      it("hides all subviews except the one with the given name", function() {
        mock(view.view1, 'show');
        mock(view.view2, 'hide');
        mock(view.view3, 'show');

        view.hideAllExcept('view1', 'view3');
        
        expect(view.view1.show).to(haveBeenCalled, once);
        expect(view.view2.hide).to(haveBeenCalled, once);
        expect(view.view3.show).to(haveBeenCalled, once);
      });
    });
  });
}});
