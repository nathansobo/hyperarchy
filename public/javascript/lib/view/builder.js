constructor("View.Builder", {
  eigenprops: {
    initialize: function() {
      this.generate_tag_methods();
    },

    supported_tags: [
      'acronym', 'address', 'area', 'b', 'base', 'bdo', 'big', 'blockquote', 'body',
      'br', 'button', 'caption', 'cite', 'code', 'dd', 'del', 'div', 'dl', 'dt', 'em',
      'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'html', 'i',
      'img', 'iframe', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'map',
      'meta', 'noframes', 'noscript', 'ol', 'optgroup', 'option', 'p', 'param', 'pre',
      'samp', 'script', 'select', 'small', 'span', 'strong', 'style', 'sub', 'sup',
      'table', 'tbody', 'td', 'textarea', 'th', 'thead', 'title', 'tr', 'tt', 'ul', 'var'
    ],

    self_closing_tags: { 'br': 1, 'hr': 1, 'input': 1, 'img': 1 },

    generate_tag_methods: function() {
      var self = this;

      Util.each(this.supported_tags, function(tag_name) {
        self.prototype[tag_name] = function() {
          var tag_args = [tag_name].concat(Util.to_array(arguments));
          return this.tag.apply(this, tag_args);
        }
      });
    }
  },

  initialize: function() {
    this.instructions = [];
    this.preceding_element_path = [0];
  },

  a: function() {
    var close_tag_instruction = this.tag.apply(this, ["a"].concat(Util.to_array(arguments)));
    var open_tag_instruction = close_tag_instruction.open_tag_instruction;
    if (open_tag_instruction.attributes && open_tag_instruction.attributes.local) {
      close_tag_instruction.click(function() {
        var href = this.attr('href');
        var following_hash = href.replace(/^.*#/, '');
        jQuery.history.load(following_hash);
        return false;
      });
    }
    return close_tag_instruction;
  },

  to_view: function(properties) {
    var self = this;
    var view = jQuery(this.to_html());
    this.view = view;

    view._show = view.show;
    view._hide = view.hide;
    if (properties) mixin(view, properties);

    Util.each(this.instructions, function(instruction) {
      instruction.post_process(self);
    });



    if (view.initialize) view.initialize();
    this.view = null;
    return view;
  },

  to_html: function() {
    var html = "";
    Util.each(this.instructions, function(instruction) {
      html += instruction.to_html();
    });
    return html;
  },

  subview: function() {
    var args = this.parse_subview_arguments(arguments);


    this.div().on_build(function(element, view) {
      var subview = args.template.to_view(args.properties || {});
      if (args.collection_name) {
        if (!view[args.collection_name]) view[args.collection_name] = {};
        view[args.collection_name][args.index] = subview;
      } else {
        view[args.name] = subview;
      }
      element.replaceWith(subview);
    });
  },

  parse_subview_arguments: function(args) {
    var args = Util.to_array(args);
    var subview_arguments = {};
    if (args[1].to_view) {
      subview_arguments.name = args[0];
      subview_arguments.template = args[1];
      if (args[2]) subview_arguments.properties = args[2];
    } else {
      subview_arguments.collection_name = args[0];
      subview_arguments.index = args[1];
      subview_arguments.template = args[2];
      if (args[3]) subview_arguments.properties = args[3];
    }
    return subview_arguments;
  },

  tag: function() {
    var args = this.parse_tag_arguments(arguments);
    if (args.text && args.body) throw new Error("Tags cannot have both text and body content");
    if (this.constructor.self_closing_tags[args.name]) {
      return this.self_closing_tag(args);
    } else {
      return this.standard_tag_sequence(args);
    }
  },

  self_closing_tag: function(tag_args) {
    if (tag_args.text || tag_args.body) throw new Error("Self-closing tag " + tag_args.name + " cannot contain text or have body content");
    var tag_instruction = new View.SelfClosingTag(tag_args.name, tag_args.attributes);
    this.instructions.push(tag_instruction);
    return tag_instruction;
  },

  standard_tag_sequence: function(tag_args) {
    var open_tag_instruction = new View.OpenTag(tag_args.name, tag_args.attributes);
    this.instructions.push(open_tag_instruction);
    if (tag_args.text) this.instructions.push(new View.TextNode(tag_args.text));
    if (tag_args.body) tag_args.body();
    var close_tag_instruction = new View.CloseTag(tag_args.name);
    close_tag_instruction.open_tag_instruction = open_tag_instruction;
    this.instructions.push(close_tag_instruction);
    return close_tag_instruction;
  },

  parse_tag_arguments: function(args) {
    var args = Util.to_array(args);
    var tag_arguments = {
      name: args.shift()
    }
    Util.each(args, function(arg) {
      if (typeof arg == "string") tag_arguments.text = arg;
      if (typeof arg == "object") tag_arguments.attributes = arg;
      if (typeof arg == "function") tag_arguments.body = arg;
    })
    return tag_arguments;
  },

  push_child: function() {
    this.preceding_element_path[this.preceding_element_path.length - 1]++;
    this.preceding_element_path.push(0);
  },

  pop_child: function() {
    this.preceding_element_path.pop();
  },

  find_preceding_element: function() {
    if (this.preceding_element_path.length == 1) {
      return this.view;
    } else {
      return this.view.find(this.preceding_element_selector());
    }
  },

  preceding_element_selector: function() {
    var selector_fragments = [];
    for(i = 1; i < this.preceding_element_path.length; i++) {
      selector_fragments.push(":eq(" + (this.preceding_element_path[i] - 1) + ")");
    }
    return "> " + selector_fragments.join(" > ");
  }
});