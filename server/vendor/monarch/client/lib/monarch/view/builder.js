(function(Monarch, jQuery) {

Monarch.constructor("Monarch.View.Builder", {
  constructor_properties: {
    initialize: function() {
      this.generate_tag_methods();
    },

    generate_tag_methods: function() {
      var self = this;

      Monarch.Util.each(this.supported_tags, function(tag_name) {
        self.prototype[tag_name] = function() {
          var tag_args = [tag_name].concat(Monarch.Util.to_array(arguments));
          return this.tag.apply(this, tag_args);
        }
      });
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

    self_closing_tags: { 'br': 1, 'hr': 1, 'input': 1, 'img': 1 }
  },

  initialize: function(template) {
    this.template = template;
    this.instructions = [];
    this.preceding_element_path = [0];
  },


  hash_regex: /^.*#/,

  to_view: function(view_properties) {
    var view = jQuery(this.to_html());
    if (view_properties) this.extend_with_properties(view, view_properties);
    this.post_process(view);
    if (view.initialize) view.initialize();
    return view;
  },

  to_html: function() {
    var xml = [];
    Monarch.Util.each(this.instructions, function(instruction) {
      xml.push(instruction.to_xml());
    });
    return xml.join("");
  },

  a: function() {
    var self = this;
    var close_tag_instruction = this.tag.apply(this, ["a"].concat(Monarch.Util.to_array(arguments)));
    var open_tag_instruction = close_tag_instruction.open_tag_instruction;

    if (open_tag_instruction.attributes && open_tag_instruction.attributes.local) {
      close_tag_instruction.click(function(view) {
        var href = this.attr('href');
        var following_hash = href.replace(self.hash_regex, '');
        History.load(following_hash);
        return false;
      });
    }
    return close_tag_instruction;
  },

  subview: function() {
    var args = this.parse_subview_arguments(arguments);

    this.div().on_build(function(element, view) {
      var subview = args.template.to_view(jQuery.extend({parent_view: view}, args.properties));
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
    var args = Monarch.Util.to_array(args);
    var subview_arguments = {};

    if (args[1] === undefined) throw new Error("Undefined second argument for subview '" + args[0] + "'.");
    if (args[1].to_view) {
      subview_arguments.name = args[0];
      subview_arguments.template = args[1];
      if (args[2]) subview_arguments.properties = args[2];
    } else {
      if (args[2] === undefined) throw new Error("Undefined third argument for subview '" + args[0] + "['" + args[1] + "'].");
      subview_arguments.collection_name = args[0];
      subview_arguments.index = args[1];
      subview_arguments.template = args[2];
      if (args[3]) subview_arguments.properties = args[3];
    }
    return subview_arguments;
  },

  extend_with_properties: function(jquery_fragment, properties) {
    Monarch.Util.keys(properties, function(key) {
      if (jquery_fragment[key]) jquery_fragment["_" + key] = jquery_fragment[key];
    });
    jQuery.extend(jquery_fragment, properties);
  },

  post_process: function(jquery_fragment) {
    var self = this;
    this.jquery_fragment = jquery_fragment;
    Monarch.Util.each(this.instructions, function(instruction) {
      instruction.post_process(self);
    });
    if (!this.has_single_top_level_element()) {
      throw new Error("Template content must have a single top-level element.");
    }
    this.jquery_fragment = null;
  },

  has_single_top_level_element: function() {
    return this.preceding_element_path.length == 1 && this.preceding_element_path[0] == 1
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
    var tag_instruction = new Monarch.View.SelfClosingTag(tag_args.name, tag_args.attributes);
    this.instructions.push(tag_instruction);
    return tag_instruction;
  },

  standard_tag_sequence: function(tag_args) {
    var open_tag_instruction = new Monarch.View.OpenTag(tag_args.name, tag_args.attributes);
    this.instructions.push(open_tag_instruction);
    if (tag_args.text) this.instructions.push(new Monarch.View.TextNode(tag_args.text));
    if (tag_args.body) tag_args.body();
    var close_tag_instruction = new Monarch.View.CloseTag(tag_args.name);
    close_tag_instruction.open_tag_instruction = open_tag_instruction;
    this.instructions.push(close_tag_instruction);
    return close_tag_instruction;
  },

  parse_tag_arguments: function(args) {
    var args = Monarch.Util.to_array(args);
    var tag_arguments = {
      name: args.shift()
    }
    Monarch.Util.each(args, function(arg) {
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
      return this.jquery_fragment;
    } else {
      return this.jquery_fragment.find(this.preceding_element_selector());
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

})(Monarch, jQuery);
