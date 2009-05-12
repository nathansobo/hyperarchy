//= require "../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("ViewBuilder", function() {
    var builder;
    before(function() {
      builder = new ViewBuilder();
    });

    describe("#tag", function() {
      context("when called with only the name of the tag", function() {
        context("if the tag is self-closing", function() {
          it("generates an empty self-closing tag", function() {
            builder.tag("br");
            expect(builder.to_html(), "<br/>");
          });
        });

        context("if the tag is not self-closing", function() {
          it("generates an empty open tag and a close tag", function() {
            builder.tag("div");
            expect(builder.to_html()).to(equal, "<div></div>");
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
          it("generates an open tag, calls the function, then generates a close tag", function() {
            builder.tag("div", function() {
              builder.tag("div");
            });
            expect(builder.to_html()).to(equal, '<div><div></div></div>');
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
  });
}});