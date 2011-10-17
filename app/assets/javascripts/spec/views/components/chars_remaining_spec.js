describe("Views.Components.CharsRemaining", function() {

  var charsRemaining, limit, textarea;

  beforeEach(function() {
    textarea = $('<textarea/>');
    limit = 140;
    charsRemaining = Views.Components.CharsRemaining.toView({limit: limit});
    textarea.val('123456');
    charsRemaining.field(textarea);
  });


  describe("when a field is assigned", function() {
    it("updates its text value to be the chars remaining", function() {
      expectCorrectCharsRemaining();
    });
  });

  describe("when the textarea has a keyup event", function() {
    it("updates its text value to be the chars remaining", function() {
      textarea.val('1234567');
      textarea.keyup();
      expectCorrectCharsRemaining();

      textarea.val('12345678');
      textarea.keyup();
      expectCorrectCharsRemaining();
    });
  });

  describe("when the textarea has a paste or cut event", function() {
    it("updates its text value to be the chars remaining", function() {
      textarea.val('987654321');
      textarea.trigger('paste');
      expectCorrectCharsRemaining();

      textarea.val('98');
      textarea.trigger('cut');
      expectCorrectCharsRemaining();
    });
  });

  describe("when the textarea is focused and blurred", function() {
    it("adds and removes the active class", function() {
      textarea.focus();
      expect(charsRemaining).toHaveClass('active');
      textarea.blur();
      expect(charsRemaining).not.toHaveClass('active');
    });
  });

  describe("when the textarea gets down to < 20 and then < 10 chars remaining", function() {
    it("applies the warning and then critical classes", function() {
      var criticalString = "", warningString = ""
      _.times(limit - 9, function() {
        criticalString += "X"
      });
      _.times(limit - 19, function() {
        warningString += "X"
      });

      textarea.val(warningString);
      textarea.keyup();
      expect(charsRemaining).toHaveClass('warning');
      expect(charsRemaining).not.toHaveClass('critical');

      textarea.val(criticalString);
      textarea.keyup();
      expect(charsRemaining).toHaveClass('critical');
      expect(charsRemaining).not.toHaveClass('warning');

      textarea.val("");
      textarea.keyup();
      expect(charsRemaining).not.toHaveClass('critical');
      expect(charsRemaining).not.toHaveClass('warning');
    });
  });

  function expectCorrectCharsRemaining() {
    expect(charsRemaining.text()).toBe((limit - textarea.val().length).toString());
  }
});
