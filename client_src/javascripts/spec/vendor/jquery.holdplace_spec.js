//= require "../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("jquery holdPlace plugin", function() {
    var input;

    before(function() {
      input = $("<input placeholder='placeholder text'/>");
      input.holdPlace(true);
    });
    
    describe("$.fn.holdPlace", function() {
      it("assigns the placeholder class and text if the input's value was blank at the time of the call", function() {
        expect(input.hasClass('placeHeld')).to(beTrue);
        expect(input.rawVal()).to(eq, "placeholder text");
        expect(input.val()).to(eq, "");

        var otherInput = $("<input value='foo' placeholder='placeholder text'/>");
        otherInput.holdPlace(true);
        expect(otherInput.hasClass('placeHeld')).to(beFalse);
        expect(otherInput.rawVal()).to(eq, "foo");
        expect(otherInput.val()).to(eq, "foo");
      });
    });

    describe("$.fn.val", function() {
      it("adds and removes the placeholder as needed, and always returns blank for an input with a placeholder", function() {
        expect(input.hasClass('placeHeld')).to(beTrue);
        expect(input.rawVal()).to(eq, "placeholder text");
        expect(input.val()).to(eq, "");

        input.val("funky");
        expect(input.hasClass('placeHeld')).to(beFalse);
        expect(input.val()).to(eq, "funky");

        input.val("");
        expect(input.hasClass('placeHeld')).to(beTrue);
        expect(input.rawVal()).to(eq, "placeholder text");
        expect(input.val()).to(eq, "");
      });
    });

    describe("focus and blur", function() {
      context("if the place is held before the focus event", function() {
        before(function() {
          expect(input.hasClass('placeHeld')).to(beTrue);
          expect(input.rawVal()).to(eq, "placeholder text");
          expect(input.val()).to(eq, "");
        });

        context("if the field is not blank before the blur event", function() {
          it("clears the placeholder after focus and does not add it again after blur", function() {
            input.focus();

            expect(input.hasClass('placeHeld')).to(beFalse);
            expect(input.rawVal()).to(eq, "");
            expect(input.val()).to(eq, "");

            input.rawVal("lalala");
            input.blur();

            expect(input.hasClass('placeHeld')).to(beFalse);
            expect(input.rawVal()).to(eq, "lalala");
            expect(input.val()).to(eq, "lalala");
          });
        });

        context("if the field is blank before the blur event", function() {
          it("clears the placeholder after focus and adds it again after blur", function() {
            input.focus();

            expect(input.hasClass('placeHeld')).to(beFalse);
            expect(input.rawVal()).to(eq, "");
            expect(input.val()).to(eq, "");

            // no change
            input.blur();

            expect(input.hasClass('placeHeld')).to(beTrue);
            expect(input.rawVal()).to(eq, "placeholder text");
            expect(input.val()).to(eq, "");
          });
        });
      });

      context("if the place is not held before the focus event", function() {
        before(function() {
          input.val("foo");
          expect(input.hasClass('placeHeld')).to(beFalse);
          expect(input.rawVal()).to(eq, "foo");
          expect(input.val()).to(eq, "foo");
        });

        context("if the field is not blank before the blur event", function() {
          it("does not alter the field's contents after the focus and does not add a placeholder after blur", function() {
            input.focus();

            expect(input.hasClass('placeHeld')).to(beFalse);
            expect(input.rawVal()).to(eq, "foo");
            expect(input.val()).to(eq, "foo");

            input.rawVal("bar")
            input.blur();

            expect(input.hasClass('placeHeld')).to(beFalse);
            expect(input.rawVal()).to(eq, "bar");
            expect(input.val()).to(eq, "bar");
          });
        });

        context("if the field is blank before the blur event", function() {
          it("does not alter the field's contents after the focus but does add a placeholder after blur", function() {
            input.focus();

            expect(input.hasClass('placeHeld')).to(beFalse);
            expect(input.rawVal()).to(eq, "foo");
            expect(input.val()).to(eq, "foo");

            input.rawVal("")
            input.blur();

            expect(input.hasClass('placeHeld')).to(beTrue);
            expect(input.rawVal()).to(eq, "placeholder text");
            expect(input.val()).to(eq, "");
          });
        });
      });
    });
  });
}});
