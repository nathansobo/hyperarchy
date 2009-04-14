//= require <foundation>
//= require <jquery-1.2.6>
//= require "june/predicates"
//= require "june/attribute"
//= require "june/composite_tuple"
//= require "june/domain"
//= require "june/field"
//= require "june/inner_join"
//= require "june/relation_methods"
//= require "june/selection"
//= require "june/set"
//= require "june/set_configuration"
//= require "june/set_projection"
//= require "june/string"
//= require "june/subscribable"
//= require "june/subscriber_methods"
//= require "june/subscription"
//= require "june/subscription_node"
//= require "june/tuple_methods"
//= require "june/tuple_supervisor"

module("June", function(c) { with(c) {
  def('remove', function(array, element) {
    var tuple_index = array.indexOf(element);
    if (tuple_index == -1) return null;
    array.splice(tuple_index, 1);
    return element;
  });
}});