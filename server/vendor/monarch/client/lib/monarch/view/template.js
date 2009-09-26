constructor("View.Template", {
  constructor_properties: {
    to_view: function(properties) {
      return new this().to_view(properties);
    },

    build: function(content_fn) {
      var template = new this();
      template.content = function() {
        content_fn.call(this, this.builder);
      }
      return template.to_view();
    },

    extended: function(subtemplate) {
      var superconstructor_view_properties = this.prototype.view_properties || {};
      var subconstructor_view_properties = subtemplate.prototype.view_properties || {};
      subtemplate.prototype.view_properties = jQuery.extend({}, superconstructor_view_properties, subconstructor_view_properties);
    }
  },

  to_view: function(properties) {
    var builder = new View.Builder(this);
    this.builder = builder;
    this.content(properties);
    this.builder = null;

    var view_properties = { template: this };
    mixin(view_properties, this.default_view_properties);
    if (this.view_properties) mixin(view_properties, this.view_properties);
    if (properties) mixin(view_properties, properties);
    return builder.to_view(view_properties);
  },

  default_view_properties: {
    field_values: function() {
      var values = {};
      this.find("input").each(function() {
        var elt = $(this);
        if (elt.is(':checkbox')) {
          values[elt.attr('name')] = elt.attr('checked');
        } else {
          values[elt.attr('name')] = elt.val();
        }
      });
      return values;
    },

    show: function() {
      if (this.before_show) this.before_show();
      this._show();
      if (this.after_show) this.after_show();
    },

    hide: function() {
      if (this.before_hide) this.before_hide();
      this._hide();
      if (this.after_hide) this.after_hide();
    },

    model: function(model) {
      if (!model) return this._model;
      this._model = model;
      this.populate_form_fields();
    },

    populate_form_fields: function() {
      this.populate_text_fields();
      this.populate_checkbox_fields();
    },

    save: function() {
      this.model().update(this.field_values());
    },

    populate_text_fields: function() {
      var self = this;
      var model = this.model();
      this.find("input:text").each(function() {
        var elt = $(this);
        var field_name = elt.attr('name');
        if (model[field_name]) {
          elt.val(model[field_name].call(model));
        } else {
          elt.val("");
        }
      });
    },

    populate_checkbox_fields: function() {
      var self = this;
      var model = this.model();
      this.find("input:checkbox").each(function() {
        var elt = $(this);
        var field_name = elt.attr('name');
        if (model[field_name]) {
          elt.attr('checked', model[field_name].call(model));
        } else {
          elt.attr('checked', false)
        }
      });
    }
  }
});
