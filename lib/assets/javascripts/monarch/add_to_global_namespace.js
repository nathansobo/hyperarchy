(function(Monarch) {

_.each(Monarch, function(value, key) {
  if (key == "constructor" || key == "module") return;
  window[key] = value;
});

})(Monarch);
