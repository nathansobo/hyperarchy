module("Prez", function(c) { with(c) {
  constructor("Builder", function() {
    // Metaprogrammatic method generation for tags and events

    var supported_tags = [
      'a', 'acronym', 'address', 'area', 'b', 'base', 'bdo', 'big', 'blockquote', 'body',
      'br', 'button', 'caption', 'cite', 'code', 'dd', 'del', 'div', 'dl', 'dt', 'em',
      'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'html', 'i',
      'img', 'iframe', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'map',
      'meta', 'noframes', 'noscript', 'ol', 'optgroup', 'option', 'p', 'param', 'pre',
      'samp', 'script', 'select', 'small', 'span', 'strong', 'style', 'sub', 'sup',
      'table', 'tbody', 'td', 'textarea', 'th', 'thead', 'title', 'tr', 'tt', 'ul', 'var'
    ];

    var event_types = [
      "blur", "change", "click", "dblclick", "error", "focus", "keydown", "keypress",
      "keyup", "load", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup",
      "resize", "scroll", "select", "submit", "unload"
    ];


    function generate_tag_method(tag_name) {
      def(tag_name, function() {
        return this.tag_with_array_args(tag_name, arguments);
      });
    }

    function generate_event_handler_method(event_type) {
      def(event_type, function(fn) {
        this.doc.push(new Prez.PostProcessorInstruction('bind', [event_type, null, fn]));
      });
    }

    jQuery.each(supported_tags, function() {
      generate_tag_method(this);
    });

    jQuery.each(event_types, function() {
      generate_event_handler_method(this);
    });

    // End of metaprogramming

    def("initialize", function() {
      this.doc = [];
    });

    def("tag", function() {
      if(arguments.length > 3) {
        throw("XmlBulider#tag does not accept more than three arguments");
      }
      var tag_name, attributes, value;
      tag_name = arguments[0];

      var arg1 = arguments[1];
      if(typeof arg1 == 'object') {
        attributes = arg1;
        var arg2 = arguments[2];
        if(typeof arg2 == 'function' || typeof arg2 == 'string'){
          value = arg2;
        };
      } else if(typeof arg1 == 'function' || typeof arg1 == 'string'){
        value = arg1;
        var arg2 = arguments[2];
        if(typeof arg2 == 'object') {
          attributes = arg2;
        }
      };

      if (this.is_self_closing(tag_name)) {
        this.doc.push(new Prez.SelfClosingTag(tag_name, attributes));
      } else {
        this.doc.push(new Prez.OpenTag(tag_name, attributes));
        if(typeof value == 'function') {
          value.call(this);
        } else if(typeof value == 'string') {
          this.doc.push(new Prez.Text(value));
        }
        this.doc.push(new Prez.CloseTag(tag_name));
      }

      return this;
    });

    def("self_closing_tag_hash", { 'br': 1, 'hr': 1, 'input': 1, 'img': 1 });

    def("is_self_closing", function(tag_name){
      return this.self_closing_tag_hash[tag_name];
    });

    def("tag_with_array_args", function(tag, args) {
      if(!args) return this.tag(tag);

      var new_arguments = [tag];
      for(var i=0; i < args.length; i++) {
        new_arguments.push(args[i]);
      }
      return this.tag.apply(this, new_arguments);
    });

    def("rawtext", function(value) {
      this.doc.push(new Prez.Text(value));
    });

    def("text", function(value) {
      var html = this.escape_html(value);
      this.doc.push(new Prez.Text(html));
    });

    def("escape_html", function(html) {
      return html.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;")
    });

    def("subview", function(name, template, initial_attributes) {
      this.doc.push(new Prez.PostProcessorInstruction('open_subview', [name]))
      template.content(this, initial_attributes);
      this.doc.push(new Prez.PostProcessorInstruction('close_view', [template, initial_attributes]))
    });

    def("keyed_subview", function(name, key, template, initial_attributes) {
      this.doc.push(new Prez.PostProcessorInstruction('open_subview', [name, key]))
      template.content(this, initial_attributes);
      this.doc.push(new Prez.PostProcessorInstruction('close_view', [template, initial_attributes]))
    });

    def("bind", function() {
      var type = arguments[0];
      if (arguments.length > 2) {
        var data = arguments[1];
        var fn = arguments[2];
      } else {
        var data = null;
        var fn = arguments[1];
      }

      this.doc.push(new Prez.PostProcessorInstruction('bind', [type, data, fn]));
    });

    def("to_string", function() {
      var output = "";
      for(var i=0; i < this.doc.length; i++) {
        var element = this.doc[i];
        output += element.to_string();
      }
      return output;
    });

    def("to_view", function(template, initial_attributes) {
      var string = this.to_string();
      if (string == "") return "";
      var post_processor = new Prez.PostProcessor($(string));
      for(var i=0; i < this.doc.length; i++) {
        var element = this.doc[i];
        element.post_process(post_processor);
      }
      post_processor.close_view(template, initial_attributes);
      return post_processor.root_view;
    });
  });
}});