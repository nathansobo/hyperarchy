//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Xml.Builder", function() {
    var builder;
    before(function() {
      ModuleSystem.constructor("SampleBuilder", Xml.Builder, {
        constructor_properties: {
          supported_tags: ["div", "p", "br"],
          self_closing_tags: { br: 1 }
        }
      });

      builder = new SampleBuilder();
    });
    
    after(function() {
      delete window.SampleBuilder
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

    describe("#to_jquery", function() {
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

      it("returns the xml parsed in a jQuery wrapper", function() {
        var jquery_fragment = builder.to_jquery();
        expect(jquery_fragment.find("div#hello")).to_not(be_empty)
        expect(jquery_fragment.find("div#hello p")).to_not(be_empty)
        expect(jquery_fragment.find("p:contains('Goodbye')")).to_not(be_empty)
      });

      context("when a properties hash is passed as an argument", function() {
        it("mixes the given properties into the jquery_fragment before on_build instructions are processed", function() {
          var jquery_fragment = builder.to_jquery({
            foo: "foo",
            bar: "bar"
          });

          expect(value_of_foo_when_hello_p_on_build_is_triggered).to(equal, "foo");
          expect(value_of_bar_when_hello_p_on_build_is_triggered).to(equal, "bar");
          expect(jquery_fragment.foo).to(equal, "foo");
          expect(jquery_fragment.bar).to(equal, "bar");
        });
      });

      it("invokes on_build instructions defined on the elements with a jQuery wrapper for that element and the jquery_fragment", function() {
        var jquery_fragment = builder.to_jquery();
        expect(hello_p_on_build_args[0].is("p:contains('Hello')")).to(be_true);
        expect(hello_p_on_build_args[1]).to(equal, jquery_fragment);

        expect(hello_div_on_build_args[0].is("div#hello")).to(be_true);
        expect(hello_div_on_build_args[1]).to(equal, jquery_fragment);

        expect(goodbye_p_on_build_args[0].is("p:contains('Goodbye')")).to(be_true);
        expect(goodbye_p_on_build_args[1]).to(equal, jquery_fragment);

        expect(br_on_build_args[0].is("br")).to(be_true);
        expect(br_on_build_args[1]).to(equal, jquery_fragment);
        
        expect(outer_div_on_build_args[0]).to(equal, jquery_fragment);
        expect(outer_div_on_build_args[1]).to(equal, jquery_fragment);
      });

      it("blows up if there is not a single top-level element", function() {
        expect(function() {
          new SampleBuilder().to_jquery()
        }).to(throw_exception);
        
        builder.div("top level element 1");
        builder.div("top level element 2");
        expect(function() {
          builder.to_jquery()
        }).to(throw_exception);
      });
    });

    describe("autogenerated inline event callback declarations", function() {
      var jquery_fragment, root_callback_for_click, root_callback_for_mouseover, child_callback, self_closing_tag_callback;

      before(function() {
        root_callback_for_click = mock_function("root callback");
        root_callback_for_mouseover = mock_function("root callback for mouseover");
        child_callback = mock_function("child callback");
        self_closing_tag_callback = mock_function("self-closing tag callback");
        with(builder) {
          div({'id': "root"}, function() {
            div({'id': "child"}).mouseover(child_callback);
            br().click(self_closing_tag_callback);
          }).click(root_callback_for_click).mouseover(root_callback_for_mouseover);
        }
        jquery_fragment = builder.to_jquery();
      });


      they("attach jQuery event callbacks to the generated jquery_fragment that call the given callback with the jquery_fragment and the event", function() {
        jquery_fragment.click();
        expect(root_callback_for_click).to(have_been_called, once);
        expect(root_callback_for_click.most_recent_args[0]).to(equal, jquery_fragment);
        expect(root_callback_for_click.most_recent_args[1].type).to(equal, "click");

        jquery_fragment.find("#child").mouseover();
        expect(child_callback).to(have_been_called, once);
        expect(child_callback.most_recent_args[0]).to(equal, jquery_fragment);
        expect(child_callback.most_recent_args[1].type).to(equal, "mouseover");

        jquery_fragment.find("br").click();
        expect(self_closing_tag_callback).to(have_been_called, once);
        expect(self_closing_tag_callback.most_recent_args[0]).to(equal, jquery_fragment);
        expect(self_closing_tag_callback.most_recent_args[1].type).to(equal, "click");
      });

      they("allow other declarations to be chained after them", function() {
        jquery_fragment.mouseover();
        expect(root_callback_for_mouseover).to(have_been_called);
      });
    });

    describe(".ref declarations", function() {
      var jquery_fragment, child_callback;

      before(function() {
        child_callback = mock_function("child callback");
        with(builder) {
          div({'id': 'root'}, function() {
            div({'id': 'child'}).ref('child').click(child_callback);
          }).ref('root');
        }
        jquery_fragment = builder.to_jquery();
      });

      they("create fields on the generated jquery_fragment that point to the element on which .ref was called", function() {
        expect(jquery_fragment.root.attr('id')).to(equal, 'root');
        expect(jquery_fragment.child.attr('id')).to(equal, 'child');
      });

      they("allow other declarations to be chained after them", function() {
        jquery_fragment.child.click();
        expect(child_callback).to(have_been_called);
      });
    });

    describe("#tag", function() {
      context("when called with only the name of the tag", function() {
        context("if the tag is self-closing", function() {
          it("generates an empty self-closing tag", function() {
            builder.tag("br");
            expect(builder.to_xml(), "<br/>");
          });

          it("returns the SelfClosingTag instruction", function() {
            var instruction = builder.tag("br")
            expect(instruction.constructor).to(equal, Xml.SelfClosingTag);
            expect(instruction.name).to(equal, "br");
          });
        });

        context("if the tag is not self-closing", function() {
          it("generates an empty open tag and a close tag", function() {
            builder.tag("div");
            expect(builder.to_xml()).to(equal, "<div></div>");
          });

          it("returns the CloseTag instruction with a reference to the OpenTag instruction", function() {
            var instruction = builder.tag("div");
            expect(instruction.constructor).to(equal, Xml.CloseTag);
            expect(instruction.name).to(equal, "div");
            var open_tag_instruction = instruction.open_tag_instruction;
            expect(open_tag_instruction.constructor).to(equal, Xml.OpenTag);
            expect(open_tag_instruction.name).to(equal, "div");
          });
        });
      });

      context("when called with the name of a tag and an attributes hash", function() {
        context("if the tag is self-closing", function() {
          it("generates a self-closing tag with the given attributes", function() {
            builder.tag("br", { 'id': "foo", 'class': "bar"});
            expect(builder.to_xml()).to(equal, '<br id="foo" class="bar"/>');
          });
        });

        context("if the tag is not self-closing", function() {
          it("generates an open tag with the given attributes and a close tag", function() {
            builder.tag("div", { 'id': "foo", 'class': "bar"});
            expect(builder.to_xml()).to(equal, '<div id="foo" class="bar"></div>');
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
          it("generates an open tag and a close tag surrounding the xml escaping of the given text", function() {
            builder.tag("div", "& hello");
            expect(builder.to_xml()).to(equal, "<div>&amp; hello</div>");
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
            expect(builder.to_xml()).to(equal, '<div><div></div></div>');
          });

          it("returns the CloseTag instruction with a reference to the OpenTag instruction", function() {
            expect(instruction.constructor).to(equal, Xml.CloseTag);
            expect(instruction.name).to(equal, "div");
            var open_tag_instruction = instruction.open_tag_instruction;
            expect(open_tag_instruction.constructor).to(equal, Xml.OpenTag);
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

    describe("#find_preceding_element", function() {
      before(function() {
        builder.jquery_fragment = { find: mock_function("find method on the jquery_fragment", function() {
          return "find result";
        }) };
      });

      context("when called for an element other than the root", function() {
        it("performs a find against the current jquery_fragment based on the path indicated by successive calls to #push_child and #pop_child", function() {
          builder.push_child();
          builder.push_child();
          builder.pop_child();

          expect(builder.find_preceding_element()).to(equal, "find result");
          expect(builder.jquery_fragment.find).to(have_been_called, with_args("> :eq(0)"));
          builder.jquery_fragment.find.clear();

          builder.push_child();
          builder.push_child();
          builder.pop_child();
          expect(builder.find_preceding_element()).to(equal, "find result");
          expect(builder.jquery_fragment.find).to(have_been_called, with_args("> :eq(1) > :eq(0)"));
        });
      });

      context("when called for the root element", function() {
        before(function() {
          builder.push_child();
          builder.pop_child();
        });

        it("returns the Builder's current #jquery_fragment", function() {
          expect(builder.find_preceding_element()).to(equal, builder.jquery_fragment);
        });
      });
    });
  });
}});