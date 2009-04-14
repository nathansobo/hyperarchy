module("Prez", function(c) { with(c) {
  constructor("PostProcessor", function() {
    def("initialize", function(root_view) {
      this.root_view = root_view;
      this.view_stack = [root_view];
      this.selector_stack = [0];
    });

    def("push", function() {
      this.add_child();
      this.selector_stack.push(0);
    });

    def("add_child", function() {
      if (!this.selector_stack.length == 0) {
        this.selector_stack[this.selector_stack.length - 1]++;
      }
    });

    def("pop", function() {
      this.selector_stack.pop();
    });

    def("open_subview", function(name, key) {
      var view = this.next_element();
      var current_view = this.current_view();
      if (!key) {
        current_view[name] = view;
      } else {
        if (!current_view[name]) {
          current_view[name] = {};
        }
        current_view[name][key] = view;
      }
      view.parent = current_view;
      this.view_stack.push(view);
    });

    def("close_view", function(template, initial_attributes) {
      var current_view = this.current_view();
      if (template && template.methods) {
        $.extend(current_view, template.methods);
      }
      if (template && template.configuration) {
        current_view.configuration = template.configuration;
      }
      if (initial_attributes) {
        $.extend(current_view, initial_attributes);
      }
      if (current_view.initialize) {
        current_view.initialize();
      }
      this.view_stack.pop();
    });

    def("bind", function(type, data, fn) {
      var view = this.current_view();
      this.previous_element().bind(type, data, function(event) {
        fn(event, view);
      });
    });

    def("next_element", function() {
      return this.find_element(this.next_selector());
    });

    def("previous_element", function() {
      if(this.selector_stack.length == 1) {
        if (this.root_view.length == 1) {
          return this.root_view;
        } else {
          return this.root_view.eq(this.num_root_children() - 1);
        }
      } else {
        return this.find_element(this.previous_selector());
      }
    });

    def("find_element", function(selector) {
      if(this.root_view.length == 1) {
        return this.root_view.find(selector);
      } else {
        return this.root_view.eq(this.num_root_children() - 1).find(selector);
      }
    });

    def("num_root_children", function() {
      return this.selector_stack[0];
    });

    def("next_selector", function() {
      return this.selector(true)
    });

    def("previous_selector", function() {
      return this.selector(false)
    });

    def("selector", function(next) {
      var selectors = [];
      for(var i = 1; i < this.selector_stack.length; i++) {
        if (i == this.selector_stack.length - 1) {
          var index = next ? this.selector_stack[i] + 1 : this.selector_stack[i];
          selectors.push(":nth-child(" + index + ")")
        } else {
          selectors.push(":nth-child(" + this.selector_stack[i] + ")")
        }
      }
      return "> " + selectors.join(" > ");
    });

    def("current_view", function() {
      return this.view_stack[this.view_stack.length - 1];
    });
  });
}});