constructor("ViewBuilder", {
  self_closing_tags: { 'br': 1, 'hr': 1, 'input': 1, 'img': 1 },

  initialize: function() {
    this.instructions = [];
  },

  to_html: function() {
    var html = "";
    Util.each(this.instructions, function(instruction) {
      html += instruction.to_html();
    });
    return html;
  },

  tag: function(name) {
    var args = this.parse_tag_arguments(arguments);
    if (args.text && args.body) throw new Error("Tags cannot have both text and body content");
    if (this.self_closing_tags[args.name]) {
      this.self_closing_tag(args);
    } else {
      this.standard_tag(args);
    }
  },

  self_closing_tag: function(tag_args) {
    if (tag_args.text || tag_args.body) throw new Error("Self-closing tag " + tag_args.name + " cannot contain text or have body content");
    this.instructions.push(new ViewBuilder.SelfClosingTag(tag_args.name, tag_args.attributes));
  },

  standard_tag: function(tag_args) {
    this.instructions.push(new ViewBuilder.OpenTag(tag_args.name, tag_args.attributes));
    if (tag_args.text) this.instructions.push(new ViewBuilder.TextNode(tag_args.text));
    if (tag_args.body) tag_args.body();
    this.instructions.push(new ViewBuilder.CloseTag(tag_args.name));
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
  }
});

ViewBuilder.generate_tag_methods = function() {
  var supported_tags = [
    'a', 'acronym', 'address', 'area', 'b', 'base', 'bdo', 'big', 'blockquote', 'body',
    'br', 'button', 'caption', 'cite', 'code', 'dd', 'del', 'div', 'dl', 'dt', 'em',
    'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'html', 'i',
    'img', 'iframe', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'map',
    'meta', 'noframes', 'noscript', 'ol', 'optgroup', 'option', 'p', 'param', 'pre',
    'samp', 'script', 'select', 'small', 'span', 'strong', 'style', 'sub', 'sup',
    'table', 'tbody', 'td', 'textarea', 'th', 'thead', 'title', 'tr', 'tt', 'ul', 'var'
  ];

  Util.each(supported_tags, function(tag_name) {
    ViewBuilder.prototype[tag_name] = function() {
      var tag_args = [tag_name].concat(Util.to_array(arguments));
      this.tag.apply(this, tag_args);
    }
  });
};
ViewBuilder.generate_tag_methods();



constructor("ViewBuilder.OpenTag", {
  initialize: function(name, attributes) {
    this.name = name;
    this.attributes = attributes;
  },

  to_html: function() {
    return "<" + this.name + this.attributes_html() + ">"
  },

  attributes_html: function() {
    var attribute_pairs = [];
    for (var attribute_name in this.attributes) {
      attribute_pairs.push(attribute_name + '="' + this.attributes[attribute_name] + '"');
    }
    return (attribute_pairs.length > 0) ? " " + attribute_pairs.join(" ") : "";
  }
});

constructor("ViewBuilder.SelfClosingTag", ViewBuilder.OpenTag, {
  to_html: function() {
    return "<" + this.name + this.attributes_html() + "/>"
  }
});


constructor("ViewBuilder.CloseTag", {
  initialize: function(name) {
    this.name = name;
  },

  to_html: function() {
    return "</" + this.name + ">"
  }
});

constructor("ViewBuilder.TextNode", {
  initialize: function(text) {
    this.text = text;
  },

  to_html: function() {
    return htmlEscape(this.text);
  }
});