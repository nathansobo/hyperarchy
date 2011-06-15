jQuery.fn.dragAbove = function(target) {
  var targetTop = target.offset().top;
  var myMidline = this.offset().top + (this.height() / 2);

  // this distance puts our middle at the top of what we're dragging above
  var distance = targetTop - myMidline;

  // if dragging down, our middle must be just above the top of the target
  // if dragging up, our middle must be just below the top of the target. we don't know why
  var fudgeFactor = (distance > 0) ? -1 : 1;

  this.simulate('drag', {dx: 0, dy: distance + fudgeFactor});
}

jQuery.fn.dragBelow = function(target) {
  var targetBottom = target.offset().top + target.height();
  var myMidline = this.offset().top + (this.height() / 2);

  // this distance puts our middle at the top of what we're dragging above
  var distance = targetBottom - myMidline;

  // if dragging down, our middle must be just above the top of the target
  // if dragging up, our middle must be just below the top of the target. we don't know why
  var fudgeFactor = 0;
//  var fudgeFactor = (distance > 0) ? -1 : 1;

  this.simulate('drag', {dx: 0, dy: distance + fudgeFactor});
  

  var dragDistance = this.offset().top - target.offset().top - (target.height() / 2) + 1;
  this.simulate('drag', {dx: 0, dy: -dragDistance});
}
