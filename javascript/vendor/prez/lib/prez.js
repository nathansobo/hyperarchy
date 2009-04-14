//= require <foundation>
//= require <jquery-1.3.2>
//= require "prez/builder"
//= require "prez/post_processor"
//= require "prez/open_tag"
//= require "prez/close_tag"
//= require "prez/self_closing_tag"
//= require "prez/text"
//= require "prez/post_processor_instruction"

module("Prez", function(c) { with(c) {
  def("build", function(fn_or_template, initial_attributes) {
    var builder = new Prez.Builder();

    if (fn_or_template instanceof Function) {
      fn_or_template(builder, initial_attributes);
    } else {
      fn_or_template.content(builder, initial_attributes);
    }

    return builder.to_view(fn_or_template, initial_attributes);
  });

  def("inherit", function(layout, template) {
    var merged_template = $.extend(true, {}, layout, template);

    merged_template.methods = merged_template.methods || {};

    merged_template.methods.initialize = function() {
      if(layout.methods && layout.methods.initialize) {
        layout.methods.initialize.call(this);
      }
      if(template.methods && template.methods.initialize) {
        template.methods.initialize.call(this);
      }
    };

    return merged_template;
  });
}});

