//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("View.Builder", function() {
    var builder;
    before(function() {
      builder = new View.Builder();
    });

    describe("auto-generated tag methods", function() {
      they("call through to #tag with their name as a first argument and return its result (this is one example of many tags)", function() {
        mock(builder, 'tag', function() {
          return "result";
        });
        expect(builder.p({'class': "cool_paragraph"}, "This is a paragraph")).to(equal, "result");
        expect(builder.tag).to(have_been_called, with_args("p", {'class': "cool_paragraph"}, "This is a paragraph"));
      });
    });

    describe("#a", function() {
      describe("when the 'local' attribute is set to true", function() {
        it("assigns a click handler to the link that invokes jQuery.history.load with the portion of the href following the '#' character", function() {
          mock(jQuery.history, 'load');
          builder.a({'local': true, href: "#bar"}, "Go To The Bar");
          builder.to_view().click();
          expect(jQuery.history.load).to(have_been_called, with_args('bar'));
        });
      });

      describe("when the 'local' attribute is set to false", function() {
        it("assigns a click handler to the link that invokes jQuery.history.load", function() {
          mock(jQuery.history, 'load');
          builder.a({'local': false, href: "isi.edu"}, "Go To The Information Sciences Institute");
          builder.to_view().click();
          expect(jQuery.history.load).to_not(have_been_called);
        });
      });
    });

    describe("#to_view", function() {
      var outer_div_on_build_args,
          br_on_build_args,
          hello_p_on_build_args,
          value_of_foo_when_hello_p_on_build_is_triggered,
          value_of_bar_when_hello_p_on_build_is_triggered,
          goodbye_p_on_build_args,
          hello_div_on_build_args;

      before(function() {
        with(builder) {
          div(function() {
            div({id: "hello"}, function() {
              p("Hello").on_build(function(element, view) {
                hello_p_on_build_args = Util.to_array(arguments);
                value_of_foo_when_hello_p_on_build_is_triggered = view.foo;
                value_of_bar_when_hello_p_on_build_is_triggered = view.bar;
              });
            }).on_build(function() {
              hello_div_on_build_args =  Util.to_array(arguments);
            });
            br().on_build(function() {
              br_on_build_args = arguments;
            });
            p("Goodbye").on_build(function() {
              goodbye_p_on_build_args = Util.to_array(arguments);
            });
          }).on_build(function() {
            outer_div_on_build_args = Util.to_array(arguments);
          });
        }
      });

      it("returns the html parsed in a jQuery wrapper", function() {
        var view = builder.to_view();
        expect(view.find("div#hello")).to_not(be_empty)
        expect(view.find("div#hello p")).to_not(be_empty)
        expect(view.find("p:contains('Goodbye')")).to_not(be_empty)
      });

      context("when a properties hash is passed as an argument", function() {
        it("mixes the given properties into the view before on_build instructions are processed", function() {
          var view = builder.to_view({
            foo: "foo",
            bar: "bar"
          });

          expect(value_of_foo_when_hello_p_on_build_is_triggered).to(equal, "foo");
          expect(value_of_bar_when_hello_p_on_build_is_triggered).to(equal, "bar");
          expect(view.foo).to(equal, "foo");
          expect(view.bar).to(equal, "bar");
        });

        it("invokes the 'initialize' method on the view if it supplied as a property after on_build handlers have been triggered", function() {
          var initialize = mock_function("initialize", function() {
            expect(hello_p_on_build_args).to_not(be_undefined);
          });
          var view = builder.to_view({
            initialize: initialize
          });

          expect(initialize).to(have_been_called, on_object(view));
        });
      });

      it("invokes on_build instructions defined on the elements with a jQuery wrapper for that element and the view", function() {
        var view = builder.to_view();
        expect(hello_p_on_build_args[0].is("p:contains('Hello')")).to(be_true);
        expect(hello_p_on_build_args[1]).to(equal, view);

        expect(hello_div_on_build_args[0].is("div#hello")).to(be_true);
        expect(hello_div_on_build_args[1]).to(equal, view);

        expect(goodbye_p_on_build_args[0].is("p:contains('Goodbye')")).to(be_true);
        expect(goodbye_p_on_build_args[1]).to(equal, view);

        expect(br_on_build_args[0].is("br")).to(be_true);
        expect(br_on_build_args[1]).to(equal, view);
        
        expect(outer_div_on_build_args[0]).to(equal, view);
        expect(outer_div_on_build_args[1]).to(equal, view);
      });
    });

    describe("autogenerated inline event handler declarations", function() {
      var view, root_handler_for_click, root_handler_for_mouseover, child_handler, self_closing_tag_handler;

      before(function() {
        root_handler_for_click = mock_function("root handler");
        root_handler_for_mouseover = mock_function("root handler for mouseover");
        child_handler = mock_function("child handler");
        self_closing_tag_handler = mock_function("self-closing tag handler");
        with(builder) {
          div({'id': "root"}, function() {
            div({'id': "child"}).mouseover(child_handler);
            br().click(self_closing_tag_handler);
          }).click(root_handler_for_click).mouseover(root_handler_for_mouseover);
        }
        view = builder.to_view();
      });


      they("attach jQuery event handlers to the generated view that call the given handler with the view and the event", function() {
        view.click();
        expect(root_handler_for_click).to(have_been_called, once);
        expect(root_handler_for_click.most_recent_args[0]).to(equal, view);
        expect(root_handler_for_click.most_recent_args[1].type).to(equal, "click");

        view.find("#child").mouseover();
        expect(child_handler).to(have_been_called, once);
        expect(child_handler.most_recent_args[0]).to(equal, view);
        expect(child_handler.most_recent_args[1].type).to(equal, "mouseover");

        view.find("br").click();
        expect(self_closing_tag_handler).to(have_been_called, once);
        expect(self_closing_tag_handler.most_recent_args[0]).to(equal, view);
        expect(self_closing_tag_handler.most_recent_args[1].type).to(equal, "click");
      });

      they("allow other declarations to be chained after them", function() {
        view.mouseover();
        expect(root_handler_for_mouseover).to(have_been_called);
      });
    });

    describe(".bind declarations", function() {
      var view, child_handler;

      before(function() {
        child_handler = mock_function("child handler");
        with(builder) {
          div({'id': 'root'}, function() {
            div({'id': 'child'}).bind('child').click(child_handler);
          }).bind('root');
        }
        view = builder.to_view();
      });

      they("create fields on the generated view that point to the element on which .bind was called", function() {
        expect(view.root.attr('id')).to(equal, 'root');
        expect(view.child.attr('id')).to(equal, 'child');
      });

      they("allow other declarations to be chained after them", function() {
        view.child.click();
        expect(child_handler).to(have_been_called);
      });
    });

    describe("#tag", function() {
      context("when called with only the name of the tag", function() {
        context("if the tag is self-closing", function() {
          it("generates an empty self-closing tag", function() {
            builder.tag("br");
            expect(builder.to_html(), "<br/>");
          });

          it("returns the SelfClosingTag instruction", function() {
            var instruction = builder.tag("br")
            expect(instruction.constructor).to(equal, View.SelfClosingTag);
            expect(instruction.name).to(equal, "br");
          });
        });

        context("if the tag is not self-closing", function() {
          it("generates an empty open tag and a close tag", function() {
            builder.tag("div");
            expect(builder.to_html()).to(equal, "<div></div>");
          });

          it("returns the CloseTag instruction with a reference to the OpenTag instruction", function() {
            var instruction = builder.tag("div");
            expect(instruction.constructor).to(equal, View.CloseTag);
            expect(instruction.name).to(equal, "div");
            var open_tag_instruction = instruction.open_tag_instruction;
            expect(open_tag_instruction.constructor).to(equal, View.OpenTag);
            expect(open_tag_instruction.name).to(equal, "div");
          });
        });
      });

      context("when called with the name of a tag and an attributes hash", function() {
        context("if the tag is self-closing", function() {
          it("generates a self-closing tag with the given attributes", function() {
            builder.tag("br", { 'id': "foo", 'class': "bar"});
            expect(builder.to_html()).to(equal, '<br id="foo" class="bar"/>');
          });
        });

        context("if the tag is not self-closing", function() {
          it("generates an open tag with the given attributes and a close tag", function() {
            builder.tag("div", { 'id': "foo", 'class': "bar"});
            expect(builder.to_html()).to(equal, '<div id="foo" class="bar"></div>');
          });
        });
      });

      context("when called with the name of a tag and a string", function() {
        context("if the tag is self-closing", function() {
          it("throws an exception", function() {
            expect(function() {
              builder.tag("br", "hello");
            }).to(throw_exception);
          });
        });

        context("if the tag is not self-closing", function() {
          it("generates an open tag and a close tag surrounding the html escaping of the given text", function() {
            builder.tag("div", "& hello");
            expect(builder.to_html()).to(equal, "<div>&amp; hello</div>");
          });
        });
      });

      context("when called with the name of a tag and a function", function() {
        context("if the tag is self-closing", function() {
          it("throws an exception", function() {
            expect(function() {
              builder.tag("br", function() {
                builder.tag("div");
              });
            }).to(throw_exception);
          });
        });

        context("if the tag is not self-closing", function() {
          var instruction;

          before(function() {
            instruction = builder.tag("div", function() {
              builder.tag("div");
            });
          });

          it("generates an open tag, calls the function, then generates a close tag", function() {
            expect(builder.to_html()).to(equal, '<div><div></div></div>');
          });

          it("returns the CloseTag instruction with a reference to the OpenTag instruction", function() {
            expect(instruction.constructor).to(equal, View.CloseTag);
            expect(instruction.name).to(equal, "div");
            var open_tag_instruction = instruction.open_tag_instruction;
            expect(open_tag_instruction.constructor).to(equal, View.OpenTag);
            expect(open_tag_instruction.name).to(equal, "div");
          });
        });
      });

      context("when called with the name of a tag and both a string and a function", function() {
        it("throws an exception", function() {
          expect(function() {
            builder.tag("div", "text", function() {})
          }).to(throw_exception);
        });
      });
    });

    describe("#subview", function() {
      before(function() {
        ModuleSystem.constructor("ExampleSubviewTemplate", View.Template, {
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
        it("builds a view within the current view and assigns it to that name", function() {
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


          expect(view.subview_2.html()).to(equal, view.find(".subview:contains('Subview 2')").html());
          expect(view.subview_2.foo).to(equal, "foo");
          expect(view.subview_2.bar).to(equal, "bar");
          expect(view.subview_2.subview_number).to(equal, 2);
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

    describe("#find_preceding_element", function() {
      before(function() {
        builder.view = { find: mock_function("find method on the view", function() {
          return "find result";
        }) };
      });

      context("when called for an element other than the root", function() {
        it("performs a find against the current view based on the path indicated by successive calls to #push_child and #pop_child", function() {
          builder.push_child();
          builder.push_child();
          builder.pop_child();

          expect(builder.find_preceding_element()).to(equal, "find result");
          expect(builder.view.find).to(have_been_called, with_args("> :eq(0)"));
          builder.view.find.clear();

          builder.push_child();
          builder.push_child();
          builder.pop_child();
          expect(builder.find_preceding_element()).to(equal, "find result");
          expect(builder.view.find).to(have_been_called, with_args("> :eq(1) > :eq(0)"));
        });
      });

      context("when called for the root element", function() {
        before(function() {
          builder.push_child();
          builder.pop_child();
        });

        it("returns the Builder's current #view", function() {
          expect(builder.find_preceding_element()).to(equal, builder.view);
        });
      });
    });
  });
}});
