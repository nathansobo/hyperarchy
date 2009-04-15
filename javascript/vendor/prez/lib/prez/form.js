Prez.Form = {
  content: function(builder, initial_attributes) {
    var self = this;
    with(builder) {
      form(function() {
        self.form_content(new Prez.Form.Builder(builder, self.configuration), initial_attributes);
      });
    }
  },
  
  configuration: {},
  
  methods: {
    initialize: function() {
      if(this.model) {
        this.load();
      }
    },
    
    load: function() {
      var self = this;

      if(this.before_load) {
        this.before_load();
      }

      if(this.form_fields) {
        $.each(this.form_fields, function(i, form_field) {
          form_field.load(self.model);
        });
      }
      
      if(this.after_load) {
        this.after_load();
      }
    },
    
    save: function() {
      if (this.before_save) {
        this.before_save();
      }

      if (this.form_fields) {
        var self = this;
        $.each(this.form_fields, function(i, form_field) {
          form_field.save(self.model);
        });
      }
      
      if (this.after_save) {
        this.after_save();
      }
    }
  }
};

Prez.Form.Builder = function(builder, configuration) {
  this.doc = builder.doc;
  this.configuration = configuration;
};

$.extend(Prez.Form.Builder.prototype, new Prez.Builder());
$.extend(Prez.Form.Builder.prototype, {
  label_for: function() {
    var attribute = arguments[0];
    var label_text = attribute.titleize();
    var html_attributes = {
      'for': this.id_for_attribute(attribute)
    };
    var array_args = [label_text, html_attributes];

    if(arguments.length == 2) {
      var arg1 = arguments[1];
      if(typeof arg1 == 'function') {
        array_args = [html_attributes, arg1];
      }
      else if(typeof arg1 == 'object') {
        $.extend(html_attributes, arg1);
      }
      else if(typeof arg1 == 'string') {
        array_args[0] = arg1;
      }
    }
    else if(arguments.length == 3) {
      var arg1 = arguments[1];
      if(typeof arg1 == 'string') {
        array_args[0] = arg1;
        $.extend(html_attributes, arguments[2]);
      }
      else {
        array_args[0] = $.extend(html_attributes, arg1);
        array_args[1] = arguments[2];
      }
    }

    return this.tag_with_array_args('label', array_args);
  },
  
  input_for: function() {
    var attribute = arguments[0];
    var html_attributes = {
      'id': this.id_for_attribute(attribute),
      'name': this.name_for_attribute(attribute),
      'type': 'text',
      'value': ''
    }
    if(arguments.length == 2) {
      $.extend(html_attributes, arguments[1]);
    }

    this.doc.push(new Prez.PostProcessorInstruction('register_form_field', [attribute]));
    return this.input(html_attributes);
  },
  
  select_for: function() {
    var attribute = arguments[0];
    var html_attributes = {
      'id': this.id_for_attribute(attribute),
      'name': this.name_for_attribute(attribute)
    };
    var array_args = [html_attributes];
    var hash_or_fn = arguments[1];
    var fn = arguments[2];

    if(!fn) {
      if (typeof hash_or_fn == 'function') {
        array_args.push(hash_or_fn);
      } else if (typeof hash_or_fn == 'object') {
        $.extend(html_attributes, hash_or_fn);
      }
    } else {
      $.extend(array_args[0], hash_or_fn);
      array_args.push(fn);
    }

    this.doc.push(new Prez.PostProcessorInstruction('register_form_field', [attribute]));
    return this.tag_with_array_args('select', array_args);
  },
  
  action_button: function() {
    var text = arguments[0];
    var action_name = arguments[1];

    var html_attributes = {
      'id': this.prefix() + '_button_' + action_name,
      'name': this.prefix() + '[button][' + action_name + ']',
      'type': 'button',
      'value': text
    };
    
    if (arguments.length == 3) {
      $.extend(html_attributes, arguments[2]);
    }
    
    var button = this.input(html_attributes);
    button.click(function(event, view) { 
      view[action_name].call(view);
    });
    return button;
  },

  prefix: function() {
    return this.configuration.prefix ? this.configuration.prefix : 'model';
  },

  id_for_attribute: function(attribute) {
    return this.prefix() + "_" + attribute;
  },
  
  name_for_attribute: function(attribute) {
    return this.prefix() + "[" + attribute + "]";
  }
});

$.extend(Prez.PostProcessor.prototype, {
  register_form_field: function(attribute) {
    var form_field = this.next_element();
    var current_view = this.current_view();
    if (!current_view.form_fields) current_view.form_fields = [];
    current_view.form_fields.push(new Prez.Form.FieldDefinition(attribute, form_field, current_view));
  }
});

Prez.Form.FieldDefinition = function(attribute, form_field, current_view) {
  this.attribute = attribute;
  this.form_field = form_field;
  this.current_view = current_view;
};

$.extend(Prez.Form.FieldDefinition.prototype, {
  load: function(model) {
    var value = model[this.attribute] || '';
    this.form_field.val(value);
  },
  
  save: function(model) {
    model[this.attribute] = this.form_field.val();
  }
});