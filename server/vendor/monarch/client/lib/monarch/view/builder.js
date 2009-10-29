(function(Monarch, jQuery) {

Monarch.constructor("Monarch.View.Builder", Monarch.Xml.Builder, {
  constructor_properties: {
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

  to_view: function(extend_view_with_properties) {
    var self = this;
    var view = this.to_jquery(extend_view_with_properties);
    if (view.initialize) view.initialize();
    return view;
  },

  to_html: function() {
    return this.to_xml();
  },

  a: function() {
    var close_tag_instruction = this.tag.apply(this, ["a"].concat(Monarch.Util.to_array(arguments)));
    var open_tag_instruction = close_tag_instruction.open_tag_instruction;
    if (open_tag_instruction.attributes && open_tag_instruction.attributes.local) {
      close_tag_instruction.click(function() {
        var href = this.attr('href');
        var following_hash = href.replace(/^.*#/, '');
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
  }
});

})(Monarch, jQuery);
