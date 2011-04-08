//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.Relation (abstract superclass)", function() {
    useLocalFixtures();
    var relation, insert, column1, column2, record;

    scenario("Table subclass", function() {
      init(function() {
        relation = Blog.table;
        record = relation.first();
        insert = function(fieldValues) {
          Blog.table.createFromRemote(fieldValues);
        }
        column1 = Blog.userId;
        column2 = Blog.name_;
      })
    });

    scenario("Selection subclass", function() {
      init(function() {
        relation = Blog.where(Blog.userId.eq("jan"));
        record = relation.first();
        insert = function(fieldValues) {
          Blog.table.createFromRemote(fieldValues);
        }
        column1 = Blog.userId;
        column2 = Blog.name_;
      })
    });

    describe("#fetch()", function() {
      it("calls Server.fetch with itself", function() {
        mock(Server, 'fetch', function() { return "mock future"; });
        expect(relation.fetch()).to(eq, "mock future");
        expect(Server.fetch).to(haveBeenCalled, once);
        expect(Server.fetch).to(haveBeenCalled, withArgs(relation));
      });
    });

    describe("#find(idOrPredicateOrHash)", function() {
      context("when passed an id", function() {
        it("returns the Record with the given id or null if none exists", function() {
          var foundRecord = relation.find(record.id());
          expect(foundRecord).to(eq, record);
        });
      });

      context("when passed a predicate", function() {
        it("returns the first Record matching the predicate or null if none exists", function() {
          var foundRecord = relation.find(column2.eq(record.field(column2).value()));
          expect(foundRecord).to(eq, record);
        });
      });

      context("when passed a hash", function() {
        it("converts it into a predicate and performs a find with it", function() {
          var hash = {};
          hash[column1.name] = record.field(column1).value();
          hash[column2.name] = record.field(column2).value();

          var foundRecord = relation.find(hash);
          expect(foundRecord).to(eq, record);
        });
      });
    });

    describe("#contains(record)", function() {
      it("returns true if the relation has the record and false otherwise", function() {
        insert({userId: "jan"});
        expect(relation.contains(record)).to(beTrue);
      });
    });

    describe("#where(predicateOrEqualityConditions)", function() {
      context("when passed a predicate", function() {
        it("returns a Selection with the receiver as its #operand and the given predicate as its #predicate", function() {
          var predicate = Blog.userId.eq('jan');
          var selection = relation.where(predicate);
          expect(selection.constructor).to(eq, Monarch.Model.Relations.Selection);
          expect(selection.operand).to(eq, relation);
          expect(selection.predicate).to(eq, predicate);
        });
      });

      context("when passed a hash of equality conditions", function() {
        context("when passed a hash with multiple key-value pairs", function() {
          it("constructs a selections with an And predicate reflecting each key-value pair in the hash", function() {
            var selection = relation.where({ userId: "jan", name: "The Pain of Motorcycle Maintenance" });

            var predicate = selection.predicate
            expect(predicate.constructor).to(eq, Monarch.Model.Predicates.And);
            expect(predicate.operands.length).to(eq, 2);

            expect(_.detect(predicate.operands, function(eqPredicate) {
              return eqPredicate.leftOperand === Blog.userId && eqPredicate.rightOperand == "jan";
            })).toNot(beNull);

            expect(_.detect(predicate.operands, function(eqPredicate) {
              return eqPredicate.leftOperand === Blog.name_ && eqPredicate.rightOperand == "The Pain of Motorcycle Maintenance";
            })).toNot(beNull);

            expect(selection.operand).to(eq, relation);
          });
        });

        context("when passed a hash with a single key-value pair", function() {
          it("constructs a selection with an Eq predicate reflecting the key-value pair", function() {
            var selection = relation.where({ userId: "jan" });
            expect(selection.predicate.leftOperand).to(eq, Blog.userId);
            expect(selection.predicate.rightOperand).to(eq, "jan");
          });
        });

      });
    });

    describe("#join(rightOperand).on(predicate)", function() {
      it("constructs an inner join using self as the left operand, plus the given right operand and predicate", function() {
        var predicate = BlogPost.blogId.eq(Blog.id)
        var join = relation.join(BlogPost.table).on(predicate);
        expect(join.constructor).to(eq, Monarch.Model.Relations.InnerJoin);
        expect(join.leftOperand).to(eq, relation);
        expect(join.rightOperand).to(eq, BlogPost.table);
        expect(join.predicate).to(eq, predicate);
      });

      context("when given a record constructor as a rightOperand", function() {
        it("uses the constructor's table as the rightOperand", function() {
          var join = relation.join(BlogPost).on(BlogPost.blogId.eq(Blog.id));
          expect(join.rightOperand).to(eq, BlogPost.table);
        });
      });
    });

    describe("#joinTo(rightOperand)", function() {
      it("constructs an inner join using self as the left operand, plus the given right operand and an inferred predicate", function() {
        var user = User.fixture("jan");
        var join = user.blogs().joinTo(BlogPost);
        expect(join.constructor).to(eq, Monarch.Model.Relations.InnerJoin);
        expect(join.leftOperand).to(eq, user.blogs());
        expect(join.rightOperand).to(eq, BlogPost.table);
        expect(join.predicate.constructor).to(eq, Monarch.Model.Predicates.Eq);
        expect(join.predicate.leftOperand).to(eq, Blog.id);
        expect(join.predicate.rightOperand).to(eq, BlogPost.blogId);
      });
    });

    describe("#joinThrough(table)", function() {
      it("constructs an inner join to the given table with #joinTo, then projects the given table", function() {
        var user = User.fixture("jan");
        var projection = user.blogs().joinThrough(BlogPost);
        expect(projection.constructor).to(eq, Monarch.Model.Relations.TableProjection);
        expect(projection.projectedTable).to(eq, BlogPost.table);
        var join = projection.operand;
        expect(join.constructor).to(eq, Monarch.Model.Relations.InnerJoin);
        expect(join.leftOperand).to(eq, user.blogs());
        expect(join.rightOperand).to(eq, BlogPost.table);
        expect(join.predicate.constructor).to(eq, Monarch.Model.Predicates.Eq);
        expect(join.predicate.leftOperand).to(eq, Blog.id);
        expect(join.predicate.rightOperand).to(eq, BlogPost.blogId);
      });
    });

    describe("#orderBy(sortSpecifications...)", function() {
      context("when passed sortSpecifications", function() {
        it("builds an Ordering relation with the receiver as its #operand and the given #sortSpecifications", function() {
          var ordering = relation.orderBy(column1.asc(), column2.desc());
          expect(ordering.sortSpecifications[0].column).to(eq, column1);
          expect(ordering.sortSpecifications[0].direction).to(eq, "asc");
          expect(ordering.sortSpecifications[1].column).to(eq, column2);
          expect(ordering.sortSpecifications[1].direction).to(eq, "desc");
        });
      });

      context("when passed naked Columns", function() {
        it("builds an Ordering relation with the receiver as its #operand and defaults the sortSpecifications to ascending", function() {
          var ordering = relation.orderBy(column1, column2);
          expect(ordering.sortSpecifications[0].column).to(eq, column1);
          expect(ordering.sortSpecifications[0].direction).to(eq, "asc");
          expect(ordering.sortSpecifications[1].column).to(eq, column2);
          expect(ordering.sortSpecifications[1].direction).to(eq, "asc");
        });
      });

      context("when passed strings", function() {
        it("builds an Ordering relation with the receiver as its #operand and defaults the sortSpecifications to ascending", function() {
          var ordering = relation.orderBy(column1.name + " asc", column2.name + " desc");
          expect(ordering.sortSpecifications[0].column).to(eq, column1);
          expect(ordering.sortSpecifications[0].direction).to(eq, "asc");
          expect(ordering.sortSpecifications[1].column).to(eq, column2);
          expect(ordering.sortSpecifications[1].direction).to(eq, "desc");
        });
      });
    });

    describe("#project(projectedColumns...)", function() {
      context("when passed a record constructor", function() {
        it("returns a table projection based on the given constructor's table", function() {
          var projection = relation.project(BlogPost);
          expect(projection).to(beAnInstanceOf, Monarch.Model.Relations.TableProjection);
          expect(projection.operand).to(eq, relation);
          expect(projection.projectedTable).to(eq, BlogPost.table);
        });
      });

      context("when passed a table", function() {
        it("returns a table projection based on the given table", function() {
          var projection = relation.project(BlogPost.table);
          expect(projection).to(beAnInstanceOf, Monarch.Model.Relations.TableProjection);
          expect(projection.operand).to(eq, relation);
          expect(projection.projectedTable).to(eq, BlogPost.table);
        });
      });

      context("when passed a selection", function() {
        it("returns a table projection based on the given selection's table", function() {
          var projection = relation.project(BlogPost.where({blogId: "grain"}));
          expect(projection).to(beAnInstanceOf, Monarch.Model.Relations.TableProjection);
          expect(projection.operand).to(eq, relation);
          expect(projection.projectedTable).to(eq, BlogPost.table);
        });
      });
    });

    describe("#difference(rightOperand)", function() {
      it("constructs a difference with self as the #leftOperand and the given #rightOperand", function() {
        var rightOperand = Blog.where(Blog.userId.eq("jan"));
        var difference = relation.difference(rightOperand);
        expect(difference).to(beAnInstanceOf, Monarch.Model.Relations.Difference);
        expect(difference.leftOperand).to(eq, relation);
        expect(difference.rightOperand).to(eq, rightOperand);
      });
    });
  });
}});
