//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.View.Template", function() {
    var template;

    before(function() {
      Monarch.ModuleSystem.constructor("ExampleTemplate", Monarch.View.Template, {
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
          boldName: function() {
            this.find("dt:contains('Name')").css("font-weight", "bold");
          },
          name: "Unknown",
          gender: "Unknown"
        }
      });
      
      template = new ExampleTemplate();
    });

    after(function() {
      delete window.ExampleTemplate
    });

    describe("when the template is extended", function() {
      after(function() {
        delete window.ExampleSubtemplate
      });

      specify("the subtemplate's viewProperties are merged with those of the supertemplate", function() {
        Monarch.ModuleSystem.constructor("ExampleSubtemplate", ExampleTemplate, {
          viewProperties: {
            age: "Unknown",
            name: "Joe"
          }
        });

        expect(ExampleSubtemplate.prototype.viewProperties.boldName).to(equal, ExampleTemplate.prototype.viewProperties.boldName);
        expect(ExampleSubtemplate.prototype.viewProperties.name).to(equal, "Joe");
        expect(ExampleSubtemplate.prototype.viewProperties.gender).to(equal, "Unknown");
        expect(ExampleSubtemplate.prototype.viewProperties.age).to(equal, "Unknown");
      });
    });

    describe(".toView", function() {
      it("calls #toView on an instance of the Template", function() {
        var view = ExampleTemplate.toView({});
        expect(view.template.constructor).to(equal, ExampleTemplate);
      });
    });

    describe(".build(contentFn)", function() {
      it("instantiates an anonymous Template with the given function as its content method (except it is passed the builder as a param), then returns the result of calling #toJquery on it", function() {
        var view = Monarch.View.Template.build(function(b) { with(b) {
          div({id: "foo"}, function() {
            div("BAR", {id: "bar"});
          });
        }});

        expect(view.attr('id')).to(equal, 'foo');
        expect(view.find('div#bar')).toNot(beEmpty);
      });
    });


    describe("#toView", function() {
      it("assigns .builder to a new Builder, calls #content, then returns #builder.toView", function() {
        var view = template.toView({ name: "Nathan", gender: "male"});
        expect(view.attr('id')).to(equal, "root");
      });

      it("assigns the given properties and the view properties to the returned view, overriding view properties with the given ones", function() {
        var view = template.toView({ name: "Nathan", gender: "male"});
        expect(view.name).to(equal, "Nathan");
        expect(view.gender).to(equal, "male");
        expect(view.boldName).to(equal, template.viewProperties.boldName);
      });
      
      it("assigns #template on the returned view", function() {
        var view = template.toView({});
        expect(view.template).to(equal, template);
      });
    });
  });
}});
