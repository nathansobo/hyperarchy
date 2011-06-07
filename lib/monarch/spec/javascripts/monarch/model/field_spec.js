//= require monarch_spec_helper

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Field", function() {
    useLocalFixtures();

    var record, intField;
    init(function() {
      record = User.fixture('jan');
    });

    describe("#valueIsEqual(value)", function() {
      it("converts the given value based on the column type before performing the comparison", function() {
        intField = record.field('age');
        intField.value(50);
        expect(intField.valueIsEqual(50)).to(beTrue);
        expect(intField.valueIsEqual(1)).to(beFalse);

        expect(intField.valueIsEqual('50')).to(beTrue);
        expect(intField.valueIsEqual('34')).to(beFalse);

        var dateField = record.field('signedUpAt');
        var date = new Date();
        dateField.value(date)
        expect(dateField.valueIsEqual(date)).to(beTrue)

        expect(dateField.valueIsEqual(date.getTime())).to(beTrue);
        expect(dateField.valueIsEqual(123)).to(beFalse);
      });
    });
  });
}});
