//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.View.Builder", function() {
    var builder;
    before(function() {
      builder = new Monarch.View.Builder();
    });

    describe("#a", function() {
      describe("when the 'local' attribute is set to true", function() {
        it("assigns a click callback to the link that invokes jQuery.history.load with the portion of the href following the '#' character", function() {
          mock(History, 'load');
          builder.a({'local': true, href: "#bar"}, "Go To The Bar");
          builder.to_view().click();
          expect(History.load).to(have_been_called, with_args('bar'));
        });
      });

      describe("when the 'local' attribute is set to false", function() {
        it("assigns a click callback to the link that invokes jQuery.history.load", function() {
          mock(History, 'load');
          builder.a({'local': false, href: "isi.edu"}, "Go To The Information Sciences Institute");
          builder.to_view().click();
          expect(History.load).to_not(have_been_called);
        });
      });
    });

    describe("#subview", function() {
      before(function() {
        Monarch.ModuleSystem.constructor("ExampleSubviewTemplate", Monarch.View.Template, {
          content: function(props) { with (this.builder) {
            div({'class': "subview"}, function() {
              h1("Subview " + props.subview_number);
            });
          }},

          view_properties: {
            foo: "foo",
            bar: "bar"
          }
        });
      });

      after(function() {
        delete window["ExampleSubviewTemplate"];
      });


      context("when given a subview name", function() {
        it("builds a view within the current view and assigns it to that name, with parent_view assigned to the parent", function() {
          builder.div({id: "root"}, function() {
            builder.subview("subview_1", ExampleSubviewTemplate, { subview_number: 1});
            builder.div({id: "not_in_subview"}, function() {
              builder.h1("Not In Subview");
            });
            builder.subview("subview_2", ExampleSubviewTemplate, { subview_number: 2});
          });

          var view = builder.to_view();

          expect(view.subview_1.html()).to(equal, view.find(".subview:contains('Subview 1')").html());
          expect(view.subview_1.foo).to(equal, "foo");
          expect(view.subview_1.bar).to(equal, "bar");
          expect(view.subview_1.subview_number).to(equal, 1);
          expect(view.subview_1.parent_view).to(equal, view);

          expect(view.subview_2.html()).to(equal, view.find(".subview:contains('Subview 2')").html());
          expect(view.subview_2.foo).to(equal, "foo");
          expect(view.subview_2.bar).to(equal, "bar");
          expect(view.subview_2.subview_number).to(equal, 2);
          expect(view.subview_2.parent_view).to(equal, view);
        });
      });

      context("when given a hash name and an index", function() {
        it("assigns the subview to an index on a hash with the given name, creating it if it doesn't exist", function() {
          builder.div({id: "root"}, function() {
            builder.subview("subviews", "one", ExampleSubviewTemplate, { subview_number: 1});
            builder.subview("subviews", "two", ExampleSubviewTemplate, { subview_number: 2});
          });

          var view = builder.to_view();
          expect(view.subviews.one.subview_number).to(equal, 1);
          expect(view.subviews.two.subview_number).to(equal, 2);
        });
      });
    });


    describe("#to_view", function() {
      it("invokes the 'initialize' method on the view if it supplied as a property after on_build callbacks have been triggered", function() {
        var on_build_callback = mock_function("on build callback");
        builder.div().on_build(on_build_callback);
        var initialize = mock_function("initialize", function() {
          expect(on_build_callback).to(have_been_called);
        });
        var view = builder.to_view({
          initialize: initialize
        });

        expect(initialize).to(have_been_called, on_object(view));
      });
    });
  });
}});
