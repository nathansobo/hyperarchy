(function(Monarch) {

_.constructor("Monarch.Model.SortSpecification", {
  initialize: function(column, direction) {
    this.column = column;
    this.direction = direction;
    this.directionCoefficient = (direction == "desc") ? -1 : 1; 
  }
});

})(Monarch);
