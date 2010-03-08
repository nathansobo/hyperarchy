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
          Blog.table.localCreate(fieldValues);
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
          Blog.table.localCreate(fieldValues);
        }
        column1 = Blog.userId;
        column2 = Blog.name_;
      })
    });

    describe("#fetch()", function() {
      it("calls Server.fetch with itself", function() {
        mock(Server, 'fetch', function() { return "mock future"; });
        expect(relation.fetch()).to(equal, "mock future");
        expect(Server.fetch).to(haveBeenCalled, once);
        expect(Server.fetch).to(haveBeenCalled, withArgs([relation]));
      });
    });

    describe("#find(idOrPredicateOrHash)", function() {
      context("when passed an id", function() {
        it("returns the Record with the given id or null if none exists", function() {
          var foundRecord = relation.find(record.id());
          expect(foundRecord).to(equal, record);
        });
      });

      context("when passed a predicate", function() {
        it("returns the first Record matching the predicate or null if none exists", function() {
          var foundRecord = relation.find(column2.eq(record.field(column2).value()));
          expect(foundRecord).to(equal, record);
        });
      });

      context("when passed a hash", function() {
        it("converts it into a predicate and performs a find with it", function() {
          var hash = {};
          hash[column1.name] = record.field(column1).value();
          hash[column2.name] = record.field(column2).value();

          var foundRecord = relation.find(hash);
          expect(foundRecord).to(equal, record);
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
          expect(selection.constructor).to(equal, Monarch.Model.Relations.Selection);
          expect(selection.operand).to(equal, relation);
          expect(selection.predicate).to(equal, predicate);
        });
      });

      context("when passed a hash of equality conditions", function() {
        context("when passed a hash with multiple key-value pairs", function() {
          it("constructs a selections with an And predicate reflecting each key-value pair in the hash", function() {
            var selection = relation.where({ userId: "jan", name: "The Pain of Motorcycle Maintenance" });

            var predicate = selection.predicate
            expect(predicate.constructor).to(equal, Monarch.Model.Predicates.And);
            expect(predicate.operands.length).to(equal, 2);

            expect(_.detect(predicate.operands, function(eqPredicate) {
              return eqPredicate.leftOperand === Blog.userId && eqPredicate.rightOperand == "jan";
            })).toNot(beNull);

            expect(_.detect(predicate.operands, function(eqPredicate) {
              return eqPredicate.leftOperand === Blog.name_ && eqPredicate.rightOperand == "The Pain of Motorcycle Maintenance";
            })).toNot(beNull);

            expect(selection.operand).to(equal, relation);
          });
        });

        context("when passed a hash with a single key-value pair", function() {
          it("constructs a selection with an Eq predicate reflecting the key-value pair", function() {
            var selection = relation.where({ userId: "jan" });
            expect(selection.predicate.leftOperand).to(equal, Blog.userId);
            expect(selection.predicate.rightOperand).to(equal, "jan");
          });
        });

      });
    });

    describe("#join(rightOperand).on(predicate)", function() {
      it("constructs an inner join using self as the left operand, plus the given right operand and predicate", function() {
        var predicate = BlogPost.blogId.eq(Blog.id)
        var join = relation.join(BlogPost.table).on(predicate);
        expect(join.constructor).to(equal, Monarch.Model.Relations.InnerJoin);
        expect(join.leftOperand).to(equal, relation);
        expect(join.rightOperand).to(equal, BlogPost.table);
        expect(join.predicate).to(equal, predicate);
      });

      context("when given a record constructor as a rightOperand", function() {
        it("uses the constructor's table as the rightOperand", function() {
          var join = relation.join(BlogPost).on(BlogPost.blogId.eq(Blog.id));
          expect(join.rightOperand).to(equal, BlogPost.table);
        });
      });
    });

    describe("#joinTo(rightOperand)", function() {
      it("constructs an inner join using self as the left operand, plus the given right operand and an inferred predicate", function() {
        var user = User.find("jan");
        var join = user.blogs().joinTo(BlogPost);
        expect(join.constructor).to(equal, Monarch.Model.Relations.InnerJoin);
        expect(join.leftOperand).to(equal, user.blogs());
        expect(join.rightOperand).to(equal, BlogPost.table);
        expect(join.predicate.constructor).to(equal, Monarch.Model.Predicates.Eq);
        expect(join.predicate.leftOperand).to(equal, Blog.id);
        expect(join.predicate.rightOperand).to(equal, BlogPost.blogId);
      });
    });

    describe("#joinThrough(table)", function() {
      it("constructs an inner join to the given table with #joinTo, then projects the given table", function() {
        var user = User.find("jan");
        var projection = user.blogs().joinThrough(BlogPost);
        expect(projection.constructor).to(equal, Monarch.Model.Relations.TableProjection);
        expect(projection.projectedTable).to(equal, BlogPost.table);
        var join = projection.operand;
        expect(join.constructor).to(equal, Monarch.Model.Relations.InnerJoin);
        expect(join.leftOperand).to(equal, user.blogs());
        expect(join.rightOperand).to(equal, BlogPost.table);
        expect(join.predicate.constructor).to(equal, Monarch.Model.Predicates.Eq);
        expect(join.predicate.leftOperand).to(equal, Blog.id);
        expect(join.predicate.rightOperand).to(equal, BlogPost.blogId);
      });
    });

    describe("#orderBy(orderByColumns...)", function() {
      context("when passed OrderByColumns", function() {
        it("builds an Ordering relation with the receiver as its #operand and the given #orderByColumns", function() {
          var ordering = relation.orderBy(column1.asc(), column2.desc());
          expect(ordering.orderByColumns[0].column).to(equal, column1);
          expect(ordering.orderByColumns[0].direction).to(equal, "asc");
          expect(ordering.orderByColumns[1].column).to(equal, column2);
          expect(ordering.orderByColumns[1].direction).to(equal, "desc");
        });
      });

      context("when passed naked Columns", function() {
        it("builds an Ordering relation with the receiver as its #operand and defaults the OrderByColumns to ascending", function() {
          var ordering = relation.orderBy(column1, column2);
          expect(ordering.orderByColumns[0].column).to(equal, column1);
          expect(ordering.orderByColumns[0].direction).to(equal, "asc");
          expect(ordering.orderByColumns[1].column).to(equal, column2);
          expect(ordering.orderByColumns[1].direction).to(equal, "asc");
        });
      });

      context("when passed strings", function() {
        it("builds an Ordering relation with the receiver as its #operand and defaults the OrderByColumns to ascending", function() {
          var ordering = relation.orderBy(column1.name + " asc", column2.name + " desc");
          expect(ordering.orderByColumns[0].column).to(equal, column1);
          expect(ordering.orderByColumns[0].direction).to(equal, "asc");
          expect(ordering.orderByColumns[1].column).to(equal, column2);
          expect(ordering.orderByColumns[1].direction).to(equal, "desc");
        });
      });
    });

    describe("#project(projectedColumns...)", function() {
      context("when passed ProjectedColumns", function() {
        it("constructs a Projection with self as #operand and the given ProjectedColumns", function() {
          projectedColumn1 = column1.as('a');
          projectedColumn2 = column2.as('b');
          var projection = relation.project(projectedColumn1, projectedColumn2);

          expect(projection).to(beAnInstanceOf, Monarch.Model.Relations.Projection);
          expect(projection.operand).to(equal, relation);
          expect(projection.projectedColumnsByName['a']).to(equal, projectedColumn1);
          expect(projection.projectedColumnsByName['b']).to(equal, projectedColumn2);
        });
      });

      context("when passed Columns", function() {
        it("constructs a Projection with self as #operand and the given Columns converted to ProjectedColumns", function() {
          var projection = relation.project(column1, column2);
          expect(projection).to(beAnInstanceOf, Monarch.Model.Relations.Projection);
          expect(projection.operand).to(equal, relation);
          expect(projection.projectedColumnsByName[column1.name].column).to(equal, column1);
          expect(projection.projectedColumnsByName[column2.name].column).to(equal, column2);
        });
      });

      context("when passed a record constructor", function() {
        it("returns a table projection based on the given constructor's table", function() {
          var projection = relation.project(BlogPost);
          expect(projection).to(beAnInstanceOf, Monarch.Model.Relations.TableProjection);
          expect(projection.operand).to(equal, relation);
          expect(projection.projectedTable).to(equal, BlogPost.table);
        });
      });

      context("when passed a table", function() {
        it("returns a table projection based on the given table", function() {
          var projection = relation.project(BlogPost.table);
          expect(projection).to(beAnInstanceOf, Monarch.Model.Relations.TableProjection);
          expect(projection.operand).to(equal, relation);
          expect(projection.projectedTable).to(equal, BlogPost.table);
        });
      });
    });

    describe("#difference(rightOperand)", function() {
      it("constructs a difference with self as the #leftOperand and the given #rightOperand", function() {
        var rightOperand = Blog.where(Blog.userId.eq("jan"));
        var difference = relation.difference(rightOperand);
        expect(difference).to(beAnInstanceOf, Monarch.Model.Relations.Difference);
        expect(difference.leftOperand).to(equal, relation);
        expect(difference.rightOperand).to(equal, rightOperand);
      });
    });

  });
}});
