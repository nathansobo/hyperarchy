require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("Ordering", function() {
    var ordering;
    before(function() {
      ordering = new June.Relations.Ordering(User, User.age, 'asc');
    });
    
    describe("#all", function() {
      context("when #direction is ascending", function() {
        before(function() {
          ordering = new June.Relations.Ordering(User, User.age, 'asc');
        });

        it("returns #all tuples in #operand, sorted by #attribute in ascending order", function() {
          var expected_tuples = User.all().sort(function(a, b) {
            if (a.age() == b.age()) return 0;
            return (a.age() < b.age()) ? -1 : 1; 
          });
          var expected_ids = June.map(expected_tuples, function() {
            return this.id();
          });
          var actual_ids = June.map(ordering.all(), function() {
            return this.id();
          });

          expect(actual_ids).to(equal, expected_ids);
        });
      });

      context("when #direction is descending", function() {
        before(function() {
          ordering = new June.Relations.Ordering(User, User.age, 'desc');
        });

        it("returns #all tuples in #operand, sorted by #attribute in ascending order", function() {
          var expected_tuples = User.all().sort(function(a, b) {
            if (a.age() == b.age()) return 0;
            return (a.age() < b.age()) ? 1 : -1;
          });
          var expected_ids = June.map(expected_tuples, function() {
            return this.id();
          });
          var actual_ids = June.map(ordering.all(), function() {
            return this.id();
          });

          expect(actual_ids).to(equal, expected_ids);
        });
      });
    });

    describe("#attribute", function() {
      var reorder_handler;
      before(function() {
        reorder_handler = mock_function("reorder handler", function() {
          expect(ordering.attribute()).to(equal, User.name);
        });
        ordering.on_reorder(reorder_handler);
      });


      context("when called with no arguments", function() {
        it("returns the ordering attribute", function() {
          expect(ordering.attribute()).to(equal, ordering._attribute);
        });
      });

      context("when called with an Attribute", function() {
        it("returns the assigned Attribute", function() {
          expect(ordering.attribute(User.name)).to(equal, User.name);
        });

        context("when called with an Attribute that is different from the Ordering's current attribute", function() {
          it("changes the ordering attribute and triggers #on_reorder handlers with the Ordering", function() {
            expect(ordering.attribute()).to_not(equal, User.name);
            ordering.attribute(User.name);
            expect(reorder_handler).to(have_been_called, with_args(ordering));
          });
        });

        context("when called with an Attribute that is the same as the Ordering's current attribute", function() {
          it("does not trigger #on_reorder handlers", function() {
            ordering.attribute(ordering.attribute());
            expect(reorder_handler).to_not(have_been_called);
          });
        });
      });

    });

    describe("#direction", function() {
      var reorder_handler;
      before(function() {
        reorder_handler = mock_function("reorder handler", function() {
          expect(ordering.direction()).to(equal, "desc");
        });
        ordering.on_reorder(reorder_handler);
      });

      context("when called with no arguments", function() {
        it("returns the ordering direction", function() {
          expect(ordering.direction()).to(equal, ordering._direction);
        });
        
        context("when called with a direction", function() {
          it("returns the assigned direction", function() {
            expect(ordering.direction('desc')).to(equal, 'desc');
          });

          context("when called with a direction that is different from the Ordering's current direction", function() {
            it("changes the direction and triggers #on_reorder handlers with the Ordering", function() {
              expect(ordering.direction()).to_not(equal, 'desc');
              ordering.direction('desc');
              expect(reorder_handler).to(have_been_called, with_args(ordering));
            });
          });

          context("when called with a direction that is the same as the Ordering's current attribute", function() {
            it("does not trigger #on_reorder handlers", function() {
              ordering.direction(ordering.direction());
              expect(reorder_handler).to_not(have_been_called);
            });
          });
        });
      });
    });
  });
}});