jasmine.StringPrettyPrinter.prototype.emitObject = function(obj) {
  var self = this;
  if (typeof obj.inspect === 'function') {
    return self.format(obj.inspect());
  }

  this.append('{ ');
  var first = true;

  this.iterateObject(obj, function(property, isGetter) {
    if (first) {
      first = false;
    } else {
      self.append(', ');
    }

    self.append(property);
    self.append(' : ');
    if (isGetter) {
      self.append('<getter>');
    } else {
      self.format(obj[property]);
    }
  });

  this.append(' }');
};

jasmine.Env.prototype.equals_ = function(a, b, mismatchKeys, mismatchValues) {
  return _.isEqual(a, b);
};

jasmine.Matchers.prototype.toBeEmpty = function(a) {
  return this.actual.length === 0;
}