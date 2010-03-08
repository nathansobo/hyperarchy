(function(Monarch, jQuery) {

Monarch.constructor("Monarch.View.Builder", {
  constructorProperties: {
    initialize: function() {
      this.generateTagMethods();
    },

    generateTagMethods: function() {
      var self = this;

      _.each(this.supportedTags, function(tagName) {
        self.prototype[tagName] = function() {
          var tagArgs = [tagName].concat(Monarch.Util.toArray(arguments));
          return this.tag.apply(this, tagArgs);
        }
      });
    },

    supportedTags: [
      'acronym', 'address', 'area', 'b', 'base', 'bdo', 'big', 'blockquote', 'body',
      'br', 'button', 'caption', 'cite', 'code', 'dd', 'del', 'div', 'dl', 'dt', 'em',
      'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'html', 'i',
      'img', 'iframe', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'map',
      'meta', 'noframes', 'noscript', 'ol', 'optgroup', 'option', 'p', 'param', 'pre',
      'samp', 'script', 'select', 'small', 'span', 'strong', 'style', 'sub', 'sup',
      'table', 'tbody', 'td', 'textarea', 'th', 'thead', 'title', 'tr', 'tt', 'ul', 'var'
    ],

    selfClosingTags: { 'br': 1, 'hr': 1, 'input': 1, 'img': 1 }
  },

  initialize: function(template) {
    this.template = template;
    this.instructions = [];
    this.precedingElementPath = [0];
  },


  hashRegex: /^.*#/,

  toView: function(viewProperties) {
    var view = jQuery(this.toHtml());
    if (viewProperties) this.extendWithProperties(view, viewProperties);
    this.postProcess(view);
    if (view.initialize) view.initialize();
    return view;
  },

  toHtml: function() {
    var xml = [];
    _.each(this.instructions, function(instruction) {
      xml.push(instruction.toXml());
    });
    return xml.join("");
  },

  a: function() {
    var self = this;
    var closeTagInstruction = this.tag.apply(this, ["a"].concat(Monarch.Util.toArray(arguments)));
    var openTagInstruction = closeTagInstruction.openTagInstruction;

    if (openTagInstruction.attributes && openTagInstruction.attributes.local) {
      closeTagInstruction.click(function(view) {
        var href = this.attr('href');
        var followingHash = href.replace(self.hashRegex, '');
        History.load(followingHash);
        return false;
      });
    }
    return closeTagInstruction;
  },

  subview: function() {
    var args = this.parseSubviewArguments(arguments);

    this.div().onBuild(function(element, view) {
      var subview = args.template.toView(jQuery.extend({parentView: view}, args.properties));
      if (args.collectionName) {
        if (!view[args.collectionName]) view[args.collectionName] = {};
        view[args.collectionName][args.index] = subview;
      } else {
        view[args.name] = subview;
      }
      element.replaceWith(subview);
    });
  },

  parseSubviewArguments: function(args) {
    var args = Monarch.Util.toArray(args);
    var subviewArguments = {};

    if (args[1] === undefined) throw new Error("Undefined second argument for subview '" + args[0] + "'.");
    if (args[1].toView) {
      subviewArguments.name = args[0];
      subviewArguments.template = args[1];
      if (args[2]) subviewArguments.properties = args[2];
    } else {
      if (args[2] === undefined) throw new Error("Undefined third argument for subview '" + args[0] + "['" + args[1] + "'].");
      subviewArguments.collectionName = args[0];
      subviewArguments.index = args[1];
      subviewArguments.template = args[2];
      if (args[3]) subviewArguments.properties = args[3];
    }
    return subviewArguments;
  },

  extendWithProperties: function(jqueryFragment, properties) {
    _.each(properties, function(value, key) {
      if (jqueryFragment[key]) jqueryFragment["_" + key] = jqueryFragment[key];
    });
    jQuery.extend(jqueryFragment, properties);
  },

  postProcess: function(jqueryFragment) {
    var self = this;
    this.jqueryFragment = jqueryFragment;
    _.each(this.instructions, function(instruction) {
      instruction.postProcess(self);
    });
    if (!this.hasSingleTopLevelElement()) {
      throw new Error("Template content must have a single top-level element.");
    }
    this.jqueryFragment = null;
  },

  hasSingleTopLevelElement: function() {
    return this.precedingElementPath.length == 1 && this.precedingElementPath[0] == 1
  },

  tag: function() {
    var args = this.parseTagArguments(arguments);
    if (args.text && args.body) throw new Error("Tags cannot have both text and body content");
    if (this.constructor.selfClosingTags[args.name]) {
      return this.selfClosingTag(args);
    } else {
      return this.standardTagSequence(args);
    }
  },

  selfClosingTag: function(tagArgs) {
    if (tagArgs.text || tagArgs.body) throw new Error("Self-closing tag " + tagArgs.name + " cannot contain text or have body content");
    var tagInstruction = new Monarch.View.SelfClosingTag(tagArgs.name, tagArgs.attributes);
    this.instructions.push(tagInstruction);
    return tagInstruction;
  },

  standardTagSequence: function(tagArgs) {
    var openTagInstruction = new Monarch.View.OpenTag(tagArgs.name, tagArgs.attributes);
    this.instructions.push(openTagInstruction);
    if (tagArgs.text) this.instructions.push(new Monarch.View.TextNode(tagArgs.text));
    if (tagArgs.body) tagArgs.body();
    var closeTagInstruction = new Monarch.View.CloseTag(tagArgs.name);
    closeTagInstruction.openTagInstruction = openTagInstruction;
    this.instructions.push(closeTagInstruction);
    return closeTagInstruction;
  },

  parseTagArguments: function(args) {
    var args = Monarch.Util.toArray(args);
    var tagArguments = {
      name: args.shift()
    }
    _.each(args, function(arg) {
      if (typeof arg == "string") tagArguments.text = arg;
      if (typeof arg == "object") tagArguments.attributes = arg;
      if (typeof arg == "function") tagArguments.body = arg;
    })
    return tagArguments;
  },

  pushChild: function() {
    this.precedingElementPath[this.precedingElementPath.length - 1]++;
    this.precedingElementPath.push(0);
  },

  popChild: function() {
    this.precedingElementPath.pop();
  },

  findPrecedingElement: function() {
    if (this.precedingElementPath.length == 1) {
      return this.jqueryFragment;
    } else {
      return this.jqueryFragment.find(this.precedingElementSelector());
    }
  },

  precedingElementSelector: function() {
    var selectorFragments = [];
    for(i = 1; i < this.precedingElementPath.length; i++) {
      selectorFragments.push(":eq(" + (this.precedingElementPath[i] - 1) + ")");
    }
    return "> " + selectorFragments.join(" > ");
  }
});

})(Monarch, jQuery);
