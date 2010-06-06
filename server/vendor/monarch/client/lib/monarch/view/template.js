(function(Monarch, jQuery) {

_.constructor("Monarch.View.Template", {
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

    extendDefaultViewProperties: function(properties) {
      _.extend(this.prototype.defaultViewProperties, properties);
    },

    inherited: function(subtemplate) {
      var superconstructorViewProperties = this.prototype.viewProperties || {};
      var subconstructorViewProperties = subtemplate.prototype.viewProperties || {};
      subtemplate.prototype.viewProperties = {};
      _.addMethods(subtemplate.prototype.viewProperties, superconstructorViewProperties);
      _.addMethods(subtemplate.prototype.viewProperties, subconstructorViewProperties);
    }
  },

  toView: function(properties) {
    var builder = new Monarch.View.Builder(this);
    this.builder = builder;
    this.content(properties);
    this.builder = null;

    var view = builder.toView();
    
    _.addMethods(view, this.defaultViewProperties);
    if (this.viewProperties) _.addMethods(view, this.viewProperties);
    var additionalProperties = { template: this }
    if (properties) _.extend(additionalProperties, properties);
    _.assignProperties(view, additionalProperties);
    if (_.isFunction(view.initialize)) view.initialize();
    if (view.viewName || view.defaultView) view.registerForNavigation();
    return view;
  },

  defaultViewProperties: {
    registerForNavigation: function() {
      jQuery(window).bind('hashchange', _.bind(function(e) {
        var state = e.getState();
        if (!this.invokeBeforeFilters(state)) return;
        if ((this.viewName && state.view == this.viewName) || (this.defaultView && !state.view)) {
          this.show();
          if (_.isFunction(this.navigate)) this.navigate(state);
        } else {
          this.hide();
        }
      }, this));
    },

    invokeBeforeFilters: function(state) {
      if (!this.beforeFilters) return true;
      return _.all(this.beforeFilters, function(beforeFilter) {
        if (_.isFunction(beforeFilter)) {
          return beforeFilter.call(this, state);
        } else {
          return this[beforeFilter](state);
        }
      }, this);
    },

    fieldValues: function() {
      var values = {};
      this.find("input,select,textarea").each(function() {
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

    show: function($super) {
      if (this.beforeShow) this.beforeShow();
      $super();
      if (this.afterShow) this.afterShow();
    },

    hide: function($super) {
      if (this.beforeHide) this.beforeHide();
      $super();
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
      this.updateSubscription = this.model().onRemoteUpdate(function(changeset) {
        _.each(changeset, function(changes, fieldName) {
          this.handleModelFieldUpdate(fieldName, changes);
        }, this);
      }, this);
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
      var assignFieldValue = _.bind(function(name, value) {
        if (!(this.model() && name && this.model()[name])) return;
        this.model()[name](value);
      }, this);

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
      var model = this.model();
      this.find("input:text, textarea").each(function() {
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

    hitch: _.Object.prototype.hitch
  }
});

})(Monarch, jQuery);
