Function.prototype.bind = function(context) {
  var args = _.toArray(arguments);
  var context = args.shift();
  var boundArgs = _.isEmpty(args) ? null : args;
  var self = this;
  return function() {
    return self.apply(context, boundArgs || arguments);
  }
}
