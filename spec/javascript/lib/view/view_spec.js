//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views constructed with View.Template#to_view", function() {
    after(function() {
      delete window['TestTemplate'];
    });

    describe("#field_values", function() {
      it("returns a hash of name value pairs for all input elements on the view", function() {
        ModuleSystem.constructor("TestTemplate", View.Template, {
          content: function() { with(this.builder) {
            div(function() {
              input({name: "foo", value: "Foo"});
              input({name: "bar", value: "Bar"});
              input({name: "baz", value: "Baz"});
            });
          }}
        });

        expect(TestTemplate.to_view().field_values()).to(equal, {
          foo: "Foo",
          bar: "Bar",
          baz: "Baz"
        });
      });
    });

    describe("#show and #hide", function() {
      var view, view_properties;

      before(function() {
        ModuleSystem.constructor("TestTemplate", View.Template, {
          content: function() { with(this.builder) {
            div("Hello");
          }},

          view_properties: view_properties
        });
        view = TestTemplate.to_view();
      });


      context("when #before_show is defined on the view", function() {
        init(function() {
          view_properties = {
            before_show: mock_function("before_show", function() {
              expect(this.is(":visible")).to(be_false);
            })
          };
        });

        it("calls it before showing the view", function() {
          view.hide();
          expect(view.is(":visible")).to(be_false);
          view.show();
          expect(view.is(":visible")).to(be_true);
          expect(view.before_show).to(have_been_called);
        });
      });

      context("when #after_show is defined on the view", function() {
        init(function() {
          view_properties = {
            after_show: mock_function("after_show", function() {
              expect(this.is(":visible")).to(be_true);
            })
          };
        });

        it("calls it after showing the view", function() {
          view.hide();
          expect(view.is(":visible")).to(be_false);
          view.show();
          expect(view.is(":visible")).to(be_true);
          expect(view.after_show).to(have_been_called);
        });
      });

      context("when #before_hide is defined on the view", function() {
        init(function() {
          view_properties = {
            before_hide: mock_function("before_hide", function() {
              expect(this.is(":visible")).to(be_true);
            })
          };
        });

        it("calls it before hiding the view", function() {
          view.hide();
          expect(view.before_hide).to(have_been_called);
        });
      });

      context("when #before_hide is defined on the view", function() {
        init(function() {
          view_properties = {
            after_hide: mock_function("after_hide", function() {
              expect(this.is(":visible")).to(be_false);
            })
          };
        });

        it("calls it before hiding the view", function() {
          view.hide();
          expect(view.after_hide).to(have_been_called);
        });
      });
    });
  });
}});