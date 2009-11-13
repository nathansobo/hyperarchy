(function(Monarch, jQuery) {

Monarch.constructor("Monarch.View.Template", Monarch.Xml.Template, {
  constructor_properties: {
    to_view: function(properties) {
      return new this().to_view(properties);
    },

    extended: function(subtemplate) {
      var superconstructor_view_properties = this.prototype.view_properties || {};
      var subconstructor_view_properties = subtemplate.prototype.view_properties || {};
      subtemplate.prototype.view_properties = jQuery.extend({}, superconstructor_view_properties, subconstructor_view_properties);
    }
  },

  to_jquery: function(properties) {
    var builder = new Monarch.View.Builder(this);
    this.builder = builder;
    this.content(properties);
    this.builder = null;

    var view_properties = { template: this };
    Monarch.ModuleSystem.mixin(view_properties, this.default_view_properties);
    if (this.view_properties) Monarch.ModuleSystem.mixin(view_properties, this.view_properties);
    if (properties) Monarch.ModuleSystem.mixin(view_properties, properties);
    return builder.to_view(view_properties);
  },

  to_view: function(properties) {
    return this.to_jquery(properties);
  },

  default_view_properties: {
    field_values: function() {
      var values = {};
      this.find("input,select").each(function() {
        var elt = $(this);
        var name = elt.attr('name');
        if (!name) return;
        if (elt.is(':checkbox')) {
          values[name] = elt.attr('checked');
        } else {
          values[name] = elt.val();
        }
      });

      if (this.custom_field_values) {
        jQuery.extend(values, this.custom_field_values());
      }

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
      if (arguments.length == 0) return this._model;
      this._model = model;
      this.populate_form_fields();
      if (this.update_subscription) {
        this.update_subscription.destroy();
        this.update_subscription = null;
      }
      if (model) this.subscribe_to_model_updates();
      if (this.model_assigned) this.model_assigned(model);
    },

    subscribe_to_model_updates: function() {
      var self = this;
      this.update_subscription = this._model.on_update(function(changeset) {
        Monarch.Util.each(changeset, function(field_name, changes) {
          self.handle_model_field_update(field_name, changes);
        });
      });
    },

    handle_model_field_update: function(field_name, changes) {
      var element = this.find("[name='" + field_name + "']");
      if (!element) return;

      if (element.attr('type') == "checkbox") {
        this.populate_checkbox_field(element, changes.new_value);
      } else {
        element.val(changes.new_value);
      }
    },

    populate_form_fields: function() {
      this.populate_text_fields();
      this.populate_checkbox_fields();
      this.populate_select_fields();
    },

    save: function() {
      if (this.model()) return this.model().update(this.field_values());
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
          self.populate_checkbox_field(elt, model[field_name].call(model));
        } else {
          self.populate_checkbox_field(elt, false);
        }
      });
    },

    populate_checkbox_field: function(element, new_value) {
      element.attr('checked', new_value);
    },

    populate_select_fields: function() {
      var self = this;
      var model = this.model();
      this.find("select").each(function() {
        var elt = $(this);
        var field_name = elt.attr('name');
        if (model[field_name]) {
          elt.val(model[field_name].call(model));
        }
      });

    }
  }
});

})(Monarch, jQuery);
