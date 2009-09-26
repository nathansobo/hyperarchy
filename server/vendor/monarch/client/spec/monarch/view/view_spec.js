//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views constructed with View.Template#to_view", function() {
    after(function() {
      delete window['TestTemplate'];
    });


    describe("form interaction methods", function() {
      var view, model;

      before(function() {
        ModuleSystem.constructor("TestTemplate", View.Template, {
          content: function() { with(this.builder) {
            div(function() {
              input({name: "foo", value: "Foo"}).ref('foo');
              input({name: "bar", value: "Bar"}).ref('bar');
              input({name: "baz", value: "Baz", type: "checkbox"}).ref('baz');
            });
          }}
        });

        view = TestTemplate.to_view();


        model = {
          foo: function() {
            return "foo";
          },

          bar: function() {
            return "bar"
          },

          baz: function(baz) {
            return true;
          },

          update: mock_function('update')
        }
      });

      describe("#field_values", function() {
        it("returns a hash of name value pairs for all input elements on the view", function() {
          expect(view.field_values()).to(equal, {
            foo: "Foo",
            bar: "Bar",
            baz: false
          });
        });
      });

      describe("#model(model)", function() {
        it("populates text fields by calling methods on the given model corresponding to their names", function() {
          expect(view.foo.val()).to(equal, "Foo");
          expect(view.bar.val()).to(equal, "Bar");
          view.model(model);
          expect(view.foo.val()).to(equal, "foo");
          expect(view.bar.val()).to(equal, "bar");
        });

        it("populates checkbox fields by calling methods on the given model corresponding to their names", function() {
          expect(view.baz.attr('checked')).to(be_false);
          view.model(model);
          expect(view.baz.attr('checked')).to(be_true);
        });
      });

      describe("#save()", function() {
        it("calls #update on #model with the results of #field_values", function() {
          view.model(model);
          view.save();
          expect(model.update).to(have_been_called, with_args(view.field_values()));
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
              expect(this.css('display')).to(equal, 'none');
            })
          };
        });

        it("calls it before showing the view", function() {
          view.hide();
          expect(view.css('display')).to(equal, 'none');
          view.show();
          expect(view.css('display')).to(equal, 'block');
          expect(view.before_show).to(have_been_called);
        });
      });

      context("when #after_show is defined on the view", function() {
        init(function() {
          view_properties = {
            after_show: mock_function("after_show", function() {
              expect(this.css('display')).to(equal, 'block');
            })
          };
        });

        it("calls it after showing the view", function() {
          view.hide();
          expect(view.css('display')).to(equal, 'none');
          view.show();
          expect(view.css('display')).to(equal, 'block');
          expect(view.after_show).to(have_been_called);
        });
      });

      context("when #before_hide is defined on the view", function() {
        init(function() {
          view_properties = {
            before_hide: mock_function("before_hide", function() {
              expect(this.css("display")).to(equal, 'block');
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
              expect(this.css('display')).to(equal, 'none');
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
