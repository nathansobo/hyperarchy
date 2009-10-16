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

        view_properties: {
          bold_name: function() {
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

      specify("the subtemplate's view_properties are merged with those of the supertemplate", function() {
        Monarch.ModuleSystem.constructor("ExampleSubtemplate", ExampleTemplate, {
          view_properties: {
            age: "Unknown",
            name: "Joe"
          }
        });

        expect(ExampleSubtemplate.prototype.view_properties.bold_name).to(equal, ExampleTemplate.prototype.view_properties.bold_name);
        expect(ExampleSubtemplate.prototype.view_properties.name).to(equal, "Joe");
        expect(ExampleSubtemplate.prototype.view_properties.gender).to(equal, "Unknown");
        expect(ExampleSubtemplate.prototype.view_properties.age).to(equal, "Unknown");
      });
    });

    describe(".to_view", function() {
      it("calls #to_view on an instance of the Template", function() {
        var view = ExampleTemplate.to_view({});
        expect(view.template.constructor).to(equal, ExampleTemplate);
      });
    });

    describe("#to_view", function() {
      it("assigns .builder to a new Builder, calls #content, then returns #builder.to_view", function() {
        var view = template.to_view({ name: "Nathan", gender: "male"});
        expect(view.attr('id')).to(equal, "root");
      });

      it("assigns the given properties and the view properties to the returned view, overriding view properties with the given ones", function() {
        var view = template.to_view({ name: "Nathan", gender: "male"});
        expect(view.name).to(equal, "Nathan");
        expect(view.gender).to(equal, "male");
        expect(view.bold_name).to(equal, template.view_properties.bold_name);
      });

      it("assigns #template on the returned view", function() {
        var view = template.to_view({});
        expect(view.template).to(equal, template);
      });
    });
  });
}});
