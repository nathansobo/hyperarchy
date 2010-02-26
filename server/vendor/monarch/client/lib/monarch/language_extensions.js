Function.prototype.bind = function(context) {
  var args = _.toArray(arguments);
  var context = args.shift();
  var bound_args = _.isEmpty(args) ? null : args;
  var self = this;
  return function() {
    return self.apply(context, bound_args || arguments);
  }
}
