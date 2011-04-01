//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.TableProjection", function() {
    var projection, operand, user, blog1, blog2, post1, post2, post3;
    useExampleDomainModel();

    init(function() {
      user = User.createFromRemote({id: 'saltpeter', fullName: "Salt Peter"});
      blog1 = user.blogs().createFromRemote({id: 1, name: "Blog 1", ownerId: 1});
      blog2 = user.blogs().createFromRemote({id: 2, name: "Blog 2", ownerId: 2});
      post1 = blog1.blogPosts().createFromRemote({id: 1, body: "this is post 1"});
      post2 = blog1.blogPosts().createFromRemote({id: 2, body: "this is post 2"});
      post3 = blog2.blogPosts().createFromRemote({id: 3, body: "this is post 3"});

      operand = user.blogs().join(BlogPost).on(BlogPost.blogId.eq(Blog.id));
      projection = operand.project(Blog);
    });


    describe("#tuples", function() {
      it("returns all unique records corresponding to the projected table", function() {
        var tuples = projection.tuples();
        expect(tuples.length).to(eq, 2);
        expect(_.include(tuples, blog1)).to(beTrue);
        expect(_.include(tuples, blog2)).to(beTrue);
      });
    });

    describe("#wireRepresentation", function() {
      it("returns the JSON representation of the table projection", function() {
        expect(projection.wireRepresentation()).to(equal, {
          type: "table_projection",
          operand: operand.wireRepresentation(),
          projected_table: "blogs"
        });
      });
    });

    describe("event handling", function() {

      var insertCallback, updateCallback, removeCallback;

      before(function() {
        insertCallback = mockFunction("insertCallback");
        updateCallback = mockFunction("updateCallback");
        removeCallback = mockFunction("removeCallback");
        projection.onInsert(insertCallback);
        projection.onUpdate(updateCallback);
        projection.onRemove(removeCallback);
      });

      describe("when a tuple is inserted into the operand", function() {
        context("if the record corresponding to the projected table is NOT already present in the projection", function() {
          it("triggers an insert event with the record", function() {
            var blog = user.blogs().createFromRemote({id: 100});
            var post = blog.blogPosts().createFromRemote({id: 1, blogId: 100});
            var sortKey = projection.buildSortKey(blog);

            expect(insertCallback).to(haveBeenCalled, once);
            expect(insertCallback).to(haveBeenCalled, withArgs(blog, 2, sortKey, sortKey));
          });
        });

        context("if the record corresponding to the projected table is already present in the projection", function() {
          it("does not trigger an insert evenrt", function() {
            blog1.blogPosts().create();
            expect(insertCallback).toNot(haveBeenCalled);
          });
        });
      });

      describe("when a record is updated in the operand", function() {
        context("if one of the updated columns is in the #projectedTable", function() {

          init(function() {
            projection = Blog.orderBy('ownerId asc').joinTo(BlogPost).project(Blog);
          });

          it("triggers onUpdate callbacks with the record's corresponding projected record and the changed columns", function() {
            blog1.update({ownerId: 100});
            expect(updateCallback).to(haveBeenCalled, once);
            expect(updateCallback).to(haveBeenCalled, withArgs(
              blog1,
              { ownerId: { column: Blog.ownerId, oldValue: 1, newValue: 100 } },
              1, 0, // new index, old index
              { 'blogs.id': 1, 'blogs.owner_id': 100 },
              { 'blogs.id': 1, 'blogs.owner_id': 1 }
            ));
          });
        });

        context("if none of the updated columns are in #projectedColumns", function() {
          it("does not trigger any callbacks", function() {
            post1.update({body: "Monkeys everywhere... Not sure if I'll make it."});
            expect(updateCallback).toNot(haveBeenCalled);
          });
        });

        context("if the same update triggers multiple update events on the same record from the operand", function() {
          it("collapses those multiple redundant events into one event", function() {
            blog1.update({name: "You Are So Stupid"});
            expect(updateCallback).to(haveBeenCalled, once);
          });
        });
      });

      describe("when a record is removed from the operand", function() {
        context("if there are NO other tuples in the operand with the same record as their projected component", function() {
          it("triggers onRemove callbacks with the removed record's corresponding projected record", function() {
            var sortKey = projection.buildSortKey(blog2);
            post3.destroy();
            expect(removeCallback).to(haveBeenCalled, withArgs(blog2, 1, sortKey, sortKey));
          });
        });

        context("if there are other tuples in the operand with the same record as their projected component", function() {
          it("does not trigger on remove callbacks", function() {
            post1.destroy();
            expect(removeCallback).toNot(haveBeenCalled);
          });
        });
      });
    });
  });
}});
