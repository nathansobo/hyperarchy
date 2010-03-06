(function(Monarch) {

Monarch.constructor("Monarch.View.SelfClosingTag", Monarch.View.CloseTag.prototype, Monarch.View.OpenTag.prototype, {
  toXml: function() {
    return "<" + this.name + this.attributesHtml() + "/>"
  },

  postProcess: function(builder) {
    builder.pushChild();
    builder.popChild();
    if (this.onBuildNode) this.onBuildNode.publish(builder.findPrecedingElement(), builder.jqueryFragment);
  }
});

})(Monarch);
