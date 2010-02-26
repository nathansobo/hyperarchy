//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.Relation (abstract superclass)", function() {
    use_local_fixtures();
    var relation, insert, column_1, column_2, record;

    scenario("Table subclass", function() {
      init(function() {
        relation = Blog.table;
        record = relation.first();
        insert = function(field_values) {
          Blog.table.local_create(field_values);
        }
        column_1 = Blog.user_id;
        column_2 = Blog.name_;
      })
    });

    scenario("Selection subclass", function() {
      init(function() {
        relation = Blog.where(Blog.user_id.eq("jan"));
        record = relation.first();
        insert = function(field_values) {
          Blog.table.local_create(field_values);
        }
        column_1 = Blog.user_id;
        column_2 = Blog.name_;
      })
    });

    describe("#fetch()", function() {
      it("calls Server.fetch with itself", function() {
        mock(Server, 'fetch', function() { return "mock future"; });
        expect(relation.fetch()).to(equal, "mock future");
        expect(Server.fetch).to(have_been_called, once);
        expect(Server.fetch).to(have_been_called, with_args([relation]));
      });
    });

    describe("#find(id_or_predicate_or_hash)", function() {
      context("when passed an id", function() {
        it("returns the Record with the given id or null if none exists", function() {
          var found_record = relation.find(record.id());
          expect(found_record).to(equal, record);
        });
      });

      context("when passed a predicate", function() {
        it("returns the first Record matching the predicate or null if none exists", function() {
          var found_record = relation.find(column_2.eq(record.field(column_2).value()));
          expect(found_record).to(equal, record);
        });
      });

      context("when passed a hash", function() {
        it("converts it into a predicate and performs a find with it", function() {
          var hash = {};
          hash[column_1.name] = record.field(column_1).value();
          hash[column_2.name] = record.field(column_2).value();

          var found_record = relation.find(hash);
          expect(found_record).to(equal, record);
        });
      });
    });

    describe("#contains(record)", function() {
      it("returns true if the relation has the record and false otherwise", function() {
        insert({user_id: "jan"});
        expect(relation.contains(record)).to(be_true);
      });
    });

    describe("#where(predicate_or_equality_conditions)", function() {
      context("when passed a predicate", function() {
        it("returns a Selection with the receiver as its #operand and the given predicate as its #predicate", function() {
          var predicate = Blog.user_id.eq('jan');
          var selection = relation.where(predicate);
          expect(selection.constructor).to(equal, Monarch.Model.Relations.Selection);
          expect(selection.operand).to(equal, relation);
          expect(selection.predicate).to(equal, predicate);
        });
      });

      context("when passed a hash of equality conditions", function() {
        context("when passed a hash with multiple key-value pairs", function() {
          it("constructs a selections with an And predicate reflecting each key-value pair in the hash", function() {
            var selection = relation.where({ user_id: "jan", name: "The Pain of Motorcycle Maintenance" });

            var predicate = selection.predicate
            expect(predicate.constructor).to(equal, Monarch.Model.Predicates.And);
            expect(predicate.operands.length).to(equal, 2);

            expect(Monarch.Util.detect(predicate.operands, function(eq_predicate) {
              return eq_predicate.left_operand === Blog.user_id && eq_predicate.right_operand == "jan";
            })).to_not(be_null);

            expect(Monarch.Util.detect(predicate.operands, function(eq_predicate) {
              return eq_predicate.left_operand === Blog.name_ && eq_predicate.right_operand == "The Pain of Motorcycle Maintenance";
            })).to_not(be_null);

            expect(selection.operand).to(equal, relation);
          });
        });

        context("when passed a hash with a single key-value pair", function() {
          it("constructs a selection with an Eq predicate reflecting the key-value pair", function() {
            var selection = relation.where({ user_id: "jan" });
            expect(selection.predicate.left_operand).to(equal, Blog.user_id);
            expect(selection.predicate.right_operand).to(equal, "jan");
          });
        });

      });
    });

    describe("#join(right_operand).on(predicate)", function() {
      it("constructs an inner join using self as the left operand, plus the given right operand and predicate", function() {
        var predicate = BlogPost.blog_id.eq(Blog.id)
        var join = relation.join(BlogPost.table).on(predicate);
        expect(join.constructor).to(equal, Monarch.Model.Relations.InnerJoin);
        expect(join.left_operand).to(equal, relation);
        expect(join.right_operand).to(equal, BlogPost.table);
        expect(join.predicate).to(equal, predicate);
      });

      context("when given a record constructor as a right_operand", function() {
        it("uses the constructor's table as the right_operand", function() {
          var join = relation.join(BlogPost).on(BlogPost.blog_id.eq(Blog.id));
          expect(join.right_operand).to(equal, BlogPost.table);
        });
      });
    });

    describe("#join_to(right_operand)", function() {
      it("constructs an inner join using self as the left operand, plus the given right operand and an inferred predicate", function() {
        var user = User.find("jan");
        var join = user.blogs().join_to(BlogPost);
        expect(join.constructor).to(equal, Monarch.Model.Relations.InnerJoin);
        expect(join.left_operand).to(equal, user.blogs());
        expect(join.right_operand).to(equal, BlogPost.table);
        expect(join.predicate.constructor).to(equal, Monarch.Model.Predicates.Eq);
        expect(join.predicate.left_operand).to(equal, Blog.id);
        expect(join.predicate.right_operand).to(equal, BlogPost.blog_id);
      });
    });

    describe("#join_through(table)", function() {
      it("constructs an inner join to the given table with #join_to, then projects the given table", function() {
        var user = User.find("jan");
        var projection = user.blogs().join_through(BlogPost);
        expect(projection.constructor).to(equal, Monarch.Model.Relations.TableProjection);
        expect(projection.projected_table).to(equal, BlogPost.table);
        var join = projection.operand;
        expect(join.constructor).to(equal, Monarch.Model.Relations.InnerJoin);
        expect(join.left_operand).to(equal, user.blogs());
        expect(join.right_operand).to(equal, BlogPost.table);
        expect(join.predicate.constructor).to(equal, Monarch.Model.Predicates.Eq);
        expect(join.predicate.left_operand).to(equal, Blog.id);
        expect(join.predicate.right_operand).to(equal, BlogPost.blog_id);
      });
    });

    describe("#order_by(order_by_columns...)", function() {
      context("when passed OrderByColumns", function() {
        it("builds an Ordering relation with the receiver as its #operand and the given #order_by_columns", function() {
          var ordering = relation.order_by(column_1.asc(), column_2.desc());
          expect(ordering.order_by_columns[0].column).to(equal, column_1);
          expect(ordering.order_by_columns[0].direction).to(equal, "asc");
          expect(ordering.order_by_columns[1].column).to(equal, column_2);
          expect(ordering.order_by_columns[1].direction).to(equal, "desc");
        });
      });

      context("when passed naked Columns", function() {
        it("builds an Ordering relation with the receiver as its #operand and defaults the OrderByColumns to ascending", function() {
          var ordering = relation.order_by(column_1, column_2);
          expect(ordering.order_by_columns[0].column).to(equal, column_1);
          expect(ordering.order_by_columns[0].direction).to(equal, "asc");
          expect(ordering.order_by_columns[1].column).to(equal, column_2);
          expect(ordering.order_by_columns[1].direction).to(equal, "asc");
        });
      });

      context("when passed strings", function() {
        it("builds an Ordering relation with the receiver as its #operand and defaults the OrderByColumns to ascending", function() {
          var ordering = relation.order_by(column_1.name + " asc", column_2.name + " desc");
          expect(ordering.order_by_columns[0].column).to(equal, column_1);
          expect(ordering.order_by_columns[0].direction).to(equal, "asc");
          expect(ordering.order_by_columns[1].column).to(equal, column_2);
          expect(ordering.order_by_columns[1].direction).to(equal, "desc");
        });
      });
    });

    describe("#project(projected_columns...)", function() {
      context("when passed ProjectedColumns", function() {
        it("constructs a Projection with self as #operand and the given ProjectedColumns", function() {
          projected_column_1 = column_1.as('a');
          projected_column_2 = column_2.as('b');
          var projection = relation.project(projected_column_1, projected_column_2);

          expect(projection).to(be_an_instance_of, Monarch.Model.Relations.Projection);
          expect(projection.operand).to(equal, relation);
          expect(projection.projected_columns_by_name['a']).to(equal, projected_column_1);
          expect(projection.projected_columns_by_name['b']).to(equal, projected_column_2);
        });
      });

      context("when passed Columns", function() {
        it("constructs a Projection with self as #operand and the given Columns converted to ProjectedColumns", function() {
          var projection = relation.project(column_1, column_2);
          expect(projection).to(be_an_instance_of, Monarch.Model.Relations.Projection);
          expect(projection.operand).to(equal, relation);
          expect(projection.projected_columns_by_name[column_1.name].column).to(equal, column_1);
          expect(projection.projected_columns_by_name[column_2.name].column).to(equal, column_2);
        });
      });

      context("when passed a record constructor", function() {
        it("returns a table projection based on the given constructor's table", function() {
          var projection = relation.project(BlogPost);
          expect(projection).to(be_an_instance_of, Monarch.Model.Relations.TableProjection);
          expect(projection.operand).to(equal, relation);
          expect(projection.projected_table).to(equal, BlogPost.table);
        });
      });

      context("when passed a table", function() {
        it("returns a table projection based on the given table", function() {
          var projection = relation.project(BlogPost.table);
          expect(projection).to(be_an_instance_of, Monarch.Model.Relations.TableProjection);
          expect(projection.operand).to(equal, relation);
          expect(projection.projected_table).to(equal, BlogPost.table);
        });
      });
    });

    describe("#difference(right_operand)", function() {
      it("constructs a difference with self as the #left_operand and the given #right_operand", function() {
        var right_operand = Blog.where(Blog.user_id.eq("jan"));
        var difference = relation.difference(right_operand);
        expect(difference).to(be_an_instance_of, Monarch.Model.Relations.Difference);
        expect(difference.left_operand).to(equal, relation);
        expect(difference.right_operand).to(equal, right_operand);
      });
    });

  });
}});
