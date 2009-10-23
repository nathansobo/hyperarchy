(function(Monarch, jQuery) {

Monarch.constructor("Monarch.Xml.Builder", {
  constructor_properties: {
    initialize: function() {
      this.generate_tag_methods();
    },

    supported_tags: [],

    self_closing_tags: {},

    generate_tag_methods: function() {
      var self = this;

      Monarch.Util.each(this.supported_tags, function(tag_name) {
        self.prototype[tag_name] = function() {
          var tag_args = [tag_name].concat(Monarch.Util.to_array(arguments));
          return this.tag.apply(this, tag_args);
        }
      });
    }
  },

  open_tag_instruction_constructor: Monarch.Xml.OpenTag,

  initialize: function(template) {
    this.template = template;
    this.instructions = [];
    this.preceding_element_path = [0];
  },

  to_jquery: function(properties) {
    var jquery_fragment = jQuery(this.to_xml());
    if (properties) this.extend_with_properties(jquery_fragment, properties);
    this.post_process(jquery_fragment);
    return jquery_fragment;
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

  to_xml: function() {
    var xml = "";
    Monarch.Util.each(this.instructions, function(instruction) {
      xml += instruction.to_xml();
    });
    return xml;
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
    var tag_instruction = new Monarch.Xml.SelfClosingTag(tag_args.name, tag_args.attributes);
    this.instructions.push(tag_instruction);
    return tag_instruction;
  },

  standard_tag_sequence: function(tag_args) {
    var open_tag_instruction = new this.open_tag_instruction_constructor(tag_args.name, tag_args.attributes);
    this.instructions.push(open_tag_instruction);
    if (tag_args.text) this.instructions.push(new Monarch.Xml.TextNode(tag_args.text));
    if (tag_args.body) tag_args.body();
    var close_tag_instruction = new Monarch.Xml.CloseTag(tag_args.name);
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
