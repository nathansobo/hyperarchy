//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views constructed with Monarch.View.Template#to_view", function() {
    after(function() {
      delete window['TestTemplate'];
      delete window['SampleModel'];
    });

    describe("form interaction methods", function() {
      var view, model;

      before(function() {
        Monarch.ModuleSystem.constructor("TestTemplate", Monarch.View.Template, {
          content: function() { with(this.builder) {
            div(function() {
              input({name: "foo", value: "Foo"}).ref('foo');
              input({name: "bar", value: "Bar"}).ref('bar');
              input({name: "baz", type: "checkbox", checked: false}).ref('baz');
              input({value: "Do not include because I have no name"});

              select({name: "quux"}, function() {
                option({value: "1"});
                option({value: "2", selected: 1});
                option({value: "3"});
              }).ref('quux');
            });
          }}
        });

        view = TestTemplate.to_view();

        Monarch.constructor("SampleModel", Monarch.Model.Record, {
          constructor_initialize: function() {
            this.columns({
              foo: "string",
              bar: "string",
              baz: "boolean",
              quux: "integer"
            });
          }
        })


        model = SampleModel.local_create({
          foo: "foo",
          bar: "bar",
          baz: true,
          quux: 3
        });
        model.remotely_created({
          foo: "foo",
          bar: "bar",
          baz: true,
          quux: 3
        });  
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

        it("if a custom_field_values method is present, merges its results into the returned field_values", function() {
          view.custom_field_values = function() {
            return {
              corge: "hi there"
            }
          }
          expect(view.field_values()).to(equal, {
            foo: "Foo",
            bar: "Bar",
            baz: false,
            quux: 2,
            corge: "hi there"
          });
        });
      });

      describe("#model(model)", function() {
        it("populates text fields by calling methods on the given model corresponding to their names and keeps them updated as model changes", function() {
          expect(view.foo.val()).to(equal, "Foo");
          expect(view.bar.val()).to(equal, "Bar");
          view.model(model);
          expect(view.foo.val()).to(equal, "foo");
          expect(view.bar.val()).to(equal, "bar");
          model.update({foo: "FOO!", bar: "BAR!"});
          expect(view.foo.val()).to(equal, "FOO!");
          expect(view.bar.val()).to(equal, "BAR!");
        });

        it("populates checkbox fields by calling methods on the given model corresponding to their names and keeps them updated as model changes", function() {
          expect(view.baz.attr('checked')).to(be_false);
          view.model(model);
          expect(view.baz.attr('checked')).to(be_true);
          model.update({baz: false});
          expect(view.baz.attr('checked')).to(be_false);
        });
        
        it("populates select fields by calling methods on the given model corresponding to their name and keeps them updated as model changes", function() {
          expect(view.quux.val()).to(equal, '2');
          view.model(model);
          expect(view.quux.val()).to(equal, '3');
          model.update({quux: 1});
          expect(view.quux.val()).to(equal, '1');
        });

        it("calls the .model_assigned hook if it's defined", function() {
          view.model_assigned = mock_function("model_assigned");
          view.model(model);
          expect(view.model_assigned).to(have_been_called, with_args(model));
        });

        it("cancels previous update subscriptions when a new model is assigned", function() {
          view.model(model);
          view.model(SampleModel.local_create({foo: "new foo"}));

          expect(view.foo.val()).to(equal, 'new foo');
          model.local_update({foo: "old model foo new value"});
          expect(view.foo.val()).to(equal, 'new foo');
        });
      });

      describe("#save()", function() {

        it("calls #update on #model with the results of #field_values", function() {
          mock(model, 'update');
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
        jQuery("#test_content").html(view);
      });

      after(function() {
        jQuery("#test_content").html("");
      });


      context("when #before_show is defined on the view", function() {
        init(function() {
          view_properties = {
            before_show: mock_function("before_show", function() {
              expect(view.is(':visible')).to(be_false);
            })
          };
        });

        it("calls it before showing the view", function() {
          view.hide();

          expect(view.is(':visible')).to(be_false);
          view.show();
          expect(view.is(':visible')).to(be_true);
          expect(view.before_show).to(have_been_called);
        });
      });

      context("when #after_show is defined on the view", function() {
        init(function() {
          view_properties = {
            after_show: mock_function("after_show", function() {
              expect(view.is(':visible')).to(be_true);
            })
          };
        });

        it("calls it after showing the view", function() {
          view.hide();
          expect(view.is(':visible')).to(be_false);
          view.show();
          expect(view.is(':visible')).to(be_true);
          expect(view.after_show).to(have_been_called);
        });
      });

      context("when #before_hide is defined on the view", function() {
        init(function() {
          view_properties = {
            before_hide: mock_function("before_hide", function() {
              expect(view.is(':visible')).to(be_true);
            })
          };
        });

        it("calls it before hiding the view", function() {
          expect(view.is(':visible')).to(be_true);
          view.hide();
          expect(view.before_hide).to(have_been_called);
          expect(view.is(':visible')).to(be_false);
        });
      });

      context("when #before_hide is defined on the view", function() {
        init(function() {
          view_properties = {
            after_hide: mock_function("after_hide", function() {
              expect(view.is(':visible')).to(be_false);
            })
          };
        });

        it("calls it before hiding the view", function() {
          expect(view.is(':visible')).to(be_true);
          view.hide();
          expect(view.is(':visible')).to(be_false);
          expect(view.after_hide).to(have_been_called);
        });
      });
    });
  });
}});
