//= require monarch_spec_helper

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
        $('#testContent').html(view)

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

        model = SampleModel.createFromRemote({
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

      after(function() {
        $('#testContent').empty();
      });

      describe("#fieldValuesDiffer()", function() {
        it("returns true if any of the #fieldValues() don't match their corresponding field in model", function() {
          view.model(model);
          expect(view.fieldValuesMatchModel()).to(beTrue);

          model.foo("foo prime");
          expect(view.fieldValuesMatchModel()).to(beFalse);
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
          view.model(SampleModel.createFromRemote({foo: "new foo"}));

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

    describe("#attach", function() {
      it("calls #attach on all subviews by default", function() {
        var parentTemplate = _.constructor(Monarch.View.Template, {
          content: function() { with(this.builder) {
            div(function() {
              subview('subview1', subviewTemplate)
              subview('subview2', subviewTemplate)
            });
          }},

          viewProperties: {
            attach: function($super) {
              this.attachCalled = true;
              $super();
            }
          }
        });

        var subviewTemplate = _.constructor(Monarch.View.Template, {
          content: function() { with(this.builder) {
            div("I am a subview");
          }},

          viewProperties: {
            attach: function() {
              this.attachCalled = true;
            }
          }
        });

        var view = parentTemplate.toView();

        expect(view.attachCalled).to(beFalse);
        expect(view.subview1.attachCalled).to(beFalse);
        expect(view.subview2.attachCalled).to(beFalse);

        view.attach();

        expect(view.attachCalled).to(beTrue);
        expect(view.subview1.attachCalled).to(beTrue);
        expect(view.subview2.attachCalled).to(beTrue);
      });
    });

    describe("#getValidationErrors(xhr)", function() {
      var view;
      before(function() {
        var template = _.constructor(Monarch.View.Template, {
          content: function() { this.builder.div() }
        });
        view = template.toView();
      });

      describe("when passed xhr with a 422 status", function() {
        it("parses the response body as JSON", function() {
          var errors = view.getValidationErrors({
            responseText: JSON.stringify(["some", "errors"]),
            status: 422
          });

          expect(errors).to(equal, ["some", "errors"]);
        });
      });

      describe("when passed an xhr with non 422 status", function() {
        it("raises an exception", function() {
          var exceptionRaised = false;
          var fakeXhr = {status: 500, responseText: ''};
          try {
            view.getValidationErrors(fakeXhr);
          } catch(e) {
            exceptionRaised = true;
          }
          expect(exceptionRaised).to(beTrue);
        });
      });
    });

    describe("#registerInterest(object, methodNome, callback, context)", function() {
      var view;
      before(function() {
        var template = _.constructor(Monarch.View.Template, {
          content: function() { this.builder.div() }
        });
        view = template.toView();
      });

      it("subscribes to the given object using the specified method name, but only subscribes to this method on one object at a time and unsubscribes on destroy", function() {
        var node1 = new Monarch.SubscriptionNode();
        var node2 = new Monarch.SubscriptionNode();

        var callback = mockFunction("callback");
        var context = {};

        view.registerInterest(node1, 'subscribe', callback, context);
        expect(node1.size()).to(eq, 1);

        node1.publish("foo");
        expect(callback).to(haveBeenCalled, withArgs("foo"));
        expect(callback.mostRecentThisValue).to(eq, context);

        callback.clear();

        view.registerInterest(node2, 'subscribe', callback, context);
        expect(node1.size()).to(eq, 0);
        expect(node2.size()).to(eq, 1);

        node1.publish("bar");
        expect(callback).toNot(haveBeenCalled);

        node2.publish("baz");
        expect(callback).to(haveBeenCalled, withArgs("baz"));
        expect(callback.mostRecentThisValue).to(eq, context);

        callback.clear();

        view.remove();
        expect(node2.size()).to(eq, 0);

        node1.publish("quux");
        node2.publish("zoop!");
        expect(callback).toNot(haveBeenCalled);
      });
    });
  });
}});
