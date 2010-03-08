(function(Monarch) {

_.each(Monarch, function(value, key) {
  if (key == "constructor" || key == "module") return;
  window[key] = value;
});

window.constructor = function() {
  Monarch.ModuleSystem.constructor.apply(Monarch.ModuleSystem, arguments);
};

window.module = function() {
  Monarch.ModuleSystem.module.apply(Monarch.ModuleSystem, arguments);
};

})(Monarch);
