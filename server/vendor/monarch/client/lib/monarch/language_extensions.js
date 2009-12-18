Function.prototype.bind = function(context) {
  var self = this;
  return function() {
    return self.apply(context, arguments);
  }
}
