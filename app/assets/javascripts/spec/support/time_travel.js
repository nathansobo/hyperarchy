var mockedDate, originalDate;

beforeEach(function() {
  mockedDate = undefined;
});

function freezeTime() {
  mockDateIfNeeded();
  mockedDate = new originalDate();
}

function timeTravelTo(date) {
  if (_.isNumber(date)) date = new originalDate(date);
  mockedDate = date;
}

function jump(milliseconds) {
  timeTravelTo(new Date().getTime() + milliseconds);
}

function mockDateIfNeeded() {
  if (!mockedDate) {
    originalDate = Date
    spyOn(window, 'Date').andCallFake(function() {
      return mockedDate;
    });
  }
}
