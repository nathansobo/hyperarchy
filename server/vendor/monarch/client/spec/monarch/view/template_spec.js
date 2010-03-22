//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.View.Template", function() {
    var template;

    before(function() {
      _.constructor("ExampleTemplate", Monarch.View.Template, {
        content: function(props) { with(this.builder) {
          div({'id': "root"}, function() {
            dl(function() {
              dt("Name");
              dd(props.name)
              dt("Gender");
              dd(props.gender)
            });
          });
        }},

        viewProperties: {
          propertyAccessors: ["foo"],
          boldName: function() {
            this.find("dt:contains('Name')").css("font-weight", "bold");
          }
        }
      });
      
      template = new ExampleTemplate();
    });

    after(function() {
      delete window.ExampleTemplate
    });

    describe("when the template is inherited", function() {
      after(function() {
        delete window.ExampleSubtemplate
      });

      specify("the subtemplate's viewProperties are method-added to those of the supertemplate", function() {
        mock(ExampleTemplate.prototype.viewProperties, 'boldName');
        
        _.constructor("ExampleSubtemplate", ExampleTemplate, {
          viewProperties: {
            propertyAccessors: ["bar"],
            boldName: function($super) {
              $super();
            }
          }
        });

        var view = ExampleSubtemplate.toView({});
        view.boldName()
        expect(ExampleTemplate.prototype.viewProperties.boldName).to(haveBeenCalled);
        expect(_.isFunction(view.foo)).to(beTrue);
        expect(_.isFunction(view.bar)).to(beTrue);
      });
    });

    describe(".toView", function() {
      it("calls #toView on an instance of the Template", function() {
        var view = ExampleTemplate.toView({name: "Unknown", gender: "Unknown"});
        expect(view.template.constructor).to(eq, ExampleTemplate);
      });
    });

    describe(".build(contentFn)", function() {
      it("instantiates an anonymous Template with the given function as its content method (except it is passed the builder as a param), then returns the result of calling #toJquery on it", function() {
        var view = Monarch.View.Template.build(function(b) { with(b) {
          div({id: "foo"}, function() {
            div("BAR", {id: "bar"});
          });
        }});

        expect(view.attr('id')).to(eq, 'foo');
        expect(view.find('div#bar')).toNot(beEmpty);
      });
    });

    describe("#toView(methodsOrProperties)", function() {
      it("assigns .builder to a new Builder, calls #content, then returns #builder.toView", function() {
        var view = template.toView({ name: "Nathan", gender: "male"});
        expect(view.attr('id')).to(eq, "root");
      });

      it("assigns the template.viewProperties to view, then assigns the properties passed to toView, using propertyAccessors if they are present", function() {
        var view = template.toView({ name: "Nathan", gender: "male", foo: "foo"});
        expect(view.name).to(eq, "Nathan");
        expect(view.gender).to(eq, "male");
        expect(view.boldName).to(eq, template.viewProperties.boldName);
        expect(view.foo()).to(eq, "foo");
      });
      
      it("assigns #template on the returned view", function() {
        var view = template.toView({name: "Unknown", gender: "Unknown"});
        expect(view.template).to(eq, template);
      });

      it("calls initialize on the view if it is present", function() {
        var view = template.toView({initialize: mockFunction('initialize')});
        expect(view.initialize).to(haveBeenCalled, once);
      });
    });
  });
}});
