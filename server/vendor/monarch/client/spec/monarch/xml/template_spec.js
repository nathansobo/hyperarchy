//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("View.Template", function() {
    var template;

    before(function() {
      ModuleSystem.constructor("ExampleTemplate", Xml.Template, {
        content: function(props) { with(this.builder) {
          tag('div', {id: 'root'});
        }}
      });

      template = new ExampleTemplate();
    });

    after(function() {
      delete window.ExampleTemplate
    });

    describe(".to_jquery", function() {
      it("calls #to_jquery on an instance of the Template", function() {
        var jquery_fragment = ExampleTemplate.to_jquery({});
        expect(jquery_fragment.template.constructor).to(equal, ExampleTemplate);
      });
    });

    describe(".build(content_fn)", function() {
      it("instantiates an anonymous Template with the given function as its content method (except it is passed the builder as a param), then returns the result of calling #to_jquery on it", function() {
        var jquery_fragment = View.Template.build(function(b) { with(b) {
          tag('div', {id: "foo"}, function() {
            tag('div', "BAR", {id: "bar"});
          });
        }});

        expect(jquery_fragment.attr('id')).to(equal, 'foo');
        expect(jquery_fragment.find('div#bar')).to_not(be_empty);
      });
    });

    describe("#to_jquery", function() {
      it("assigns .builder to a new Builder, calls #content, then returns #builder.to_jquery", function() {
        var jquery_fragment = template.to_jquery();
        expect(jquery_fragment.attr('id')).to(equal, "root");
      });

      it("assigns #template on the returned jquery_fragment", function() {
        var jquery_fragment = template.to_jquery();
        expect(jquery_fragment.template).to(equal, template);
      });
    });
  });
}});
