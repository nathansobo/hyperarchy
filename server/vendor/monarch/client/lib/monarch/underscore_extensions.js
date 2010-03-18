_.mixin({
  isObject: function(o) {
    return (typeof o === "object");
  },

  splitAtFirstSlash: function(s) {
    var index = s.indexOf("/");
    if (index == -1) {
      return [s, null];
    } else {
      return [s.substring(0, index), s.substring(index + 1)];
    }
  }
});