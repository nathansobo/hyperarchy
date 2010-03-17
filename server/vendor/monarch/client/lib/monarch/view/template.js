(function(Monarch, jQuery) {

Monarch.constructor("Monarch.View.Template", {
  constructorProperties: {
    build: function(contentFn) {
      var template = new this();
      template.content = function() {
        contentFn.call(this, this.builder);
      }
      return template.toView();
    },

    toView: function(properties) {
      return new this().toView(properties);
    },

    extended: function(subtemplate) {
      var superconstructorViewProperties = this.prototype.viewProperties || {};
      var subconstructorViewProperties = subtemplate.prototype.viewProperties || {};
      subtemplate.prototype.viewProperties = jQuery.extend({}, superconstructorViewProperties, subconstructorViewProperties);
    }
  },

  toView: function(properties) {
    var builder = new Monarch.View.Builder(this);
    this.builder = builder;
    this.content(properties);
    this.builder = null;

    var viewProperties = { template: this };
    Monarch.ModuleSystem.mixin(viewProperties, this.defaultViewProperties);
    if (this.viewProperties) Monarch.ModuleSystem.mixin(viewProperties, this.viewProperties);
    if (properties) Monarch.ModuleSystem.mixin(viewProperties, properties);
    return builder.toView(viewProperties);
  },

  defaultViewProperties: {
    fieldValues: function() {
      var values = {};
      this.find("input,select").each(function() {
        var elt = jQuery(this);
        var name = elt.attr('name');
        if (!name) return;
        if (elt.is(':checkbox')) {
          values[name] = elt.attr('checked');
        } else {
          values[name] = elt.val();
        }
      });

      if (this.customFieldValues) {
        jQuery.extend(values, this.customFieldValues());
      }

      return values;
    },

    show: function() {
      if (this.beforeShow) this.beforeShow();
      this._show();
      if (this.afterShow) this.afterShow();
    },

    hide: function() {
      if (this.beforeHide) this.beforeHide();
      this._hide();
      if (this.afterHide) this.afterHide();
    },

    model: {
      afterWrite: function(model) {
        this.populateFormFields();
        if (this.updateSubscription) {
          this.updateSubscription.destroy();
          this.updateSubscription = null;
        }

        if (model) this.subscribeToModelUpdates();
        if (this.modelAssigned) this.modelAssigned(model);
      }
    },

    subscribeToModelUpdates: function() {
      var self = this;
      this.updateSubscription = this.model().onRemoteUpdate(function(changeset) {
        _.each(changeset, function(changes, fieldName) {
          self.handleModelFieldUpdate(fieldName, changes);
        });
      });
    },

    handleModelFieldUpdate: function(fieldName, changes) {
      var element = this.find("[name='" + fieldName + "']");
      if (!element) return;

      if (element.attr('type') == "checkbox") {
        this.populateCheckboxField(element, changes.newValue);
      } else {
        element.val(changes.newValue);
      }
    },

    populateFormFields: function() {
      this.populateTextFields();
      this.populateCheckboxFields();
      this.populateSelectFields();
    },

    observeFormFields: function() {
      var assignFieldValue = function(name, value) {
        if (!(this.model() && name && this.model()[name])) return;
        this.model()[name](value);
      }.bind(this)

      this.find("input:text").keyup(function() {
        var elt = $(this);
        assignFieldValue(elt.attr('name'), elt.val());
      });
      
      this.find("select").change(function() {
        var elt = $(this);
        assignFieldValue(elt.attr('name'), elt.val());
      });

      this.find("input:checkbox").change(function() {
        var elt = $(this);
        assignFieldValue(elt.attr('name'), elt.attr('checked'));
      });
    },

    save: function() {
      if (this.model()) return this.model().update(this.fieldValues());
    },

    populateTextFields: function() {
      var self = this;
      var model = this.model();
      this.find("input:text").each(function() {
        var elt = jQuery(this);
        var fieldName = elt.attr('name');
        if (model[fieldName]) {
          elt.val(model[fieldName].call(model) || "");
        } else {
          elt.val("");
        }
      });
    },

    populateCheckboxFields: function() {
      var self = this;
      var model = this.model();
      this.find("input:checkbox").each(function() {
        var elt = jQuery(this);
        var fieldName = elt.attr('name');
        if (model[fieldName]) {
          self.populateCheckboxField(elt, model[fieldName].call(model));
        } else {
          self.populateCheckboxField(elt, false);
        }
      });
    },

    populateCheckboxField: function(element, newValue) {
      element.attr('checked', newValue);
    },

    populateSelectFields: function() {
      var self = this;
      var model = this.model();
      this.find("select").each(function() {
        var elt = jQuery(this);
        var fieldName = elt.attr('name');
        if (model[fieldName]) {
          elt.val(model[fieldName].call(model) || "");
        }
      });
    },

    hitch: Monarch.ModuleSystem.Object.prototype.hitch
  }
});

})(Monarch, jQuery);
