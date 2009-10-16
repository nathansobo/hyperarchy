//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views constructed with Monarch.View.Template#to_view", function() {
    after(function() {
      delete window['TestTemplate'];
    });

    describe("form interaction methods", function() {
      var view, model;

      before(function() {
        Monarch.ModuleSystem.constructor("TestTemplate", Monarch.View.Template, {
          content: function() { with(this.builder) {
            div(function() {
              input({name: "foo", value: "Foo"}).ref('foo');
              input({name: "bar", value: "Bar"}).ref('bar');
              input({name: "baz", value: "Baz", type: "checkbox"}).ref('baz');

              select({name: "quux"}, function() {
                option({value: "1"});
                option({value: "2", selected: 1});
                option({value: "3"});
              }).ref('quux');
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

          quux: function() {
            return 3;
          },

          update: mock_function('update')
        }
      });

      describe("#field_values", function() {
        it("returns a hash of name value pairs for all input elements on the view", function() {
          expect(view.field_values()).to(equal, {
            foo: "Foo",
            bar: "Bar",
            baz: false,
            quux: 2
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
        
        it("populates select fields by calling methods on the given model corresponding to their name", function() {
          expect(view.quux.val()).to(equal, '2');
          view.model(model);
          expect(view.quux.val()).to(equal, '3');
        });

        it("calls the .model_assigned hook if it's defined", function() {
          view.model_assigned = mock_function("model_assigned");
          view.model(model);
          expect(view.model_assigned).to(have_been_called, with_args(model));
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
        Monarch.ModuleSystem.constructor("TestTemplate", Monarch.View.Template, {
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
