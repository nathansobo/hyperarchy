//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views constructed with Monarch.View.Template#toView", function() {
    after(function() {
      delete window['TestTemplate'];
      delete window['SampleModel'];
    });

    describe("form interaction methods", function() {
      var view, model;

      before(function() {
        _.constructor("TestTemplate", Monarch.View.Template, {
          content: function() { with(this.builder) {
            div(function() {
              input({name: "foo", value: "Foo"}).ref('foo');
              input({name: "bar", value: "Bar"}).ref('bar');
              input({name: "baz", type: "checkbox", checked: false}).ref('baz');
              input({value: "Do not include because I have no name"});
              textarea({name: 'textarea'}, "This too");

              select({name: "quux"}, function() {
                option({value: "1"});
                option({value: "2", selected: 1});
                option({value: "3"});
              }).ref('quux');
            });
          }}
        });

        view = TestTemplate.toView();

        _.constructor("SampleModel", Monarch.Model.Record, {
          constructorInitialize: function() {
            this.columns({
              foo: "string",
              bar: "string",
              baz: "boolean",
              quux: "integer"
            });
          }
        })


        model = SampleModel.localCreate({
          foo: "foo",
          bar: "bar",
          baz: true,
          quux: 3
        });
        model.remotelyCreated({
          foo: "foo",
          bar: "bar",
          baz: true,
          quux: 3
        });  
      });

      describe("#fieldValues", function() {
        it("returns a hash of name value pairs for all input elements on the view", function() {
          expect(view.fieldValues()).to(equal, {
            foo: "Foo",
            bar: "Bar",
            baz: false,
            textarea: "This too",
            quux: 2
          });
        });

        it("if a customFieldValues method is present, merges its results into the returned fieldValues", function() {
          view.customFieldValues = function() {
            return {
              corge: "hi there"
            }
          }
          expect(view.fieldValues()).to(equal, {
            foo: "Foo",
            bar: "Bar",
            baz: false,
            quux: 2,
            textarea: "This too",
            corge: "hi there"
          });
        });
      });

      describe("#model(model)", function() {
        it("populates text fields by calling methods on the given model corresponding to their names and keeps them updated as model changes", function() {
          expect(view.foo.val()).to(eq, "Foo");
          expect(view.bar.val()).to(eq, "Bar");
          view.model(model);
          expect(view.foo.val()).to(eq, "foo");
          expect(view.bar.val()).to(eq, "bar");
          model.update({foo: "FOO!", bar: "BAR!"});
          expect(view.foo.val()).to(eq, "FOO!");
          expect(view.bar.val()).to(eq, "BAR!");
        });

        it("populates checkbox fields by calling methods on the given model corresponding to their names and keeps them updated as model changes", function() {
          expect(view.baz.attr('checked')).to(beFalse);
          view.model(model);
          expect(view.baz.attr('checked')).to(beTrue);
          model.update({baz: false});
          expect(view.baz.attr('checked')).to(beFalse);
        });
        
        it("populates select fields by calling methods on the given model corresponding to their name and keeps them updated as model changes", function() {
          expect(view.quux.val()).to(eq, '2');
          view.model(model);
          expect(view.quux.val()).to(eq, '3');
          model.update({quux: 1});
          expect(view.quux.val()).to(eq, '1');
        });

        it("calls the .modelAssigned hook if it's defined", function() {
          view.modelAssigned = mockFunction("modelAssigned");
          view.model(model);
          expect(view.modelAssigned).to(haveBeenCalled, withArgs(model));
        });

        it("cancels previous update subscriptions when a new model is assigned", function() {
          view.model(model);
          view.model(SampleModel.localCreate({foo: "new foo"}));

          expect(view.foo.val()).to(eq, 'new foo');
          model.localUpdate({foo: "old model foo new value"});
          expect(view.foo.val()).to(eq, 'new foo');
        });

        it("when a remote field is updated, only updates the form field if the local field is not dirty", function() {
          Server.auto = false;
          view.model(model);
          var fooBefore = view.foo.val();

          model.update({foo: "foo prime"});
          expect(Server.updates.length).to(eq, 1);

          model.update({foo: "foo double prime"});
          expect(Server.updates.length).to(eq, 2);

          Server.updates[0].simulateSuccess();
          expect(view.foo.val()).to(eq, fooBefore);

          Server.updates[0].simulateSuccess();
          expect(view.foo.val()).to(eq, "foo double prime");
        });
      });

      describe("#save()", function() {

        it("calls #update on #model with the results of #fieldValues", function() {
          mock(model, 'update');
          view.model(model);
          view.save();
          expect(model.update).to(haveBeenCalled, withArgs(view.fieldValues()));
        });
      });
    });

    describe("#show and #hide", function() {
      var view, viewProperties;

      before(function() {
        _.constructor("TestTemplate", Monarch.View.Template, {
          content: function() { with(this.builder) {
            div("Hello");
          }},

          viewProperties: viewProperties
        });
        view = TestTemplate.toView();
        jQuery("#testContent").html(view);
      });

      after(function() {
        jQuery("#testContent").html("");
      });


      context("when #beforeShow is defined on the view", function() {
        init(function() {
          viewProperties = {
            beforeShow: mockFunction("beforeShow", function() {
              expect(view.is(':visible')).to(beFalse);
            })
          };
        });

        it("calls it before showing the view", function() {
          view.hide();

          expect(view.is(':visible')).to(beFalse);
          view.show();
          expect(view.is(':visible')).to(beTrue);
          expect(view.beforeShow).to(haveBeenCalled);
        });
      });

      context("when #afterShow is defined on the view", function() {
        init(function() {
          viewProperties = {
            afterShow: mockFunction("afterShow", function() {
              expect(view.is(':visible')).to(beTrue);
            })
          };
        });

        it("calls it after showing the view", function() {
          view.hide();
          expect(view.is(':visible')).to(beFalse);
          view.show();
          expect(view.is(':visible')).to(beTrue);
          expect(view.afterShow).to(haveBeenCalled);
        });
      });

      context("when #beforeHide is defined on the view", function() {
        init(function() {
          viewProperties = {
            beforeHide: mockFunction("beforeHide", function() {
              expect(view.is(':visible')).to(beTrue);
            })
          };
        });

        it("calls it before hiding the view", function() {
          expect(view.is(':visible')).to(beTrue);
          view.hide();
          expect(view.beforeHide).to(haveBeenCalled);
          expect(view.is(':visible')).to(beFalse);
        });
      });

      context("when #beforeHide is defined on the view", function() {
        init(function() {
          viewProperties = {
            afterHide: mockFunction("afterHide", function() {
              expect(view.is(':visible')).to(beFalse);
            })
          };
        });

        it("calls it before hiding the view", function() {
          expect(view.is(':visible')).to(beTrue);
          view.hide();
          expect(view.is(':visible')).to(beFalse);
          expect(view.afterHide).to(haveBeenCalled);
        });
      });
    });
  });
}});
