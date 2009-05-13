//= require "../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("View.Builder", function() {
    var builder;
    before(function() {
      builder = new View.Builder();
    });

    describe("auto-generated tag methods", function() {
      they("call through to tag with their name as a first argument (this is one example of many tags)", function() {
        mock(builder, 'tag');
        builder.a({'href': "/the_moon"}, "Go to the moon");
        expect(builder.tag).to(have_been_called, with_args("a", {'href': "/the_moon"}, "Go to the moon"));
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

          it("returns the OpenTag instruction", function() {
            var instruction = builder.tag("div");
            expect(instruction.constructor).to(equal, View.OpenTag);
            expect(instruction.name).to(equal, "div");
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

          it("returns the OpenTag instruction", function() {
            expect(instruction.constructor).to(equal, View.OpenTag);
            expect(instruction.name).to(equal, "div");
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

    describe("#to_view", function() {
      var outer_div_on_build_arguments,
          hello_p_on_build_args,
          goodbye_p_on_build_arguments,
          hello_div_on_build_arguments;

      before(function() {
        with(builder) {
          div(function() {
            div({id: "hello"}, function() {
              p("Hello").on_build(function() {
                hello_p_on_build_args = Util.to_array(arguments);
              });
            }).on_build(function() {
              hello_div_on_build_arguments =  Util.to_array(arguments);
            });
            p("Goodbye").on_build(function() {
              goodbye_p_on_build_arguments = Util.to_array(arguments);
            });
          }).on_build(function() {
            outer_div_on_build_arguments = Util.to_array(arguments);
          });
        }
      });

      it("returns the html parsed in a jQuery wrapper", function() {
        var view = builder.to_view();
        expect(view.find("div#hello")).to_not(be_empty)
        expect(view.find("div#hello p")).to_not(be_empty)
        expect(view.find("p:contains('Goodbye')")).to_not(be_empty)
      });

      it("invokes on_build instructions defined on the elements with a jQuery wrapper for that element and the view", function() {
        expect(outer_div_on_build_arguments[1]).to(equal, view);
        expect(outer_div_on_build_arguments[0]).to(equal, view);
      });
    });
  });
}});