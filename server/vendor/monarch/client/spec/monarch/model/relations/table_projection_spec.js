//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.TableProjection", function() {
    var projection, operand, user, blog1, blog2, post1, post2, post3;
    useExampleDomainModel();

    before(function() {
      user = User.createFromRemote({id: 'saltpeter', fullName: "Salt Peter"});
      blog1 = user.blogs().createFromRemote({id: 'blog1', name: "Blog 1"});
      blog2 = user.blogs().createFromRemote({id: 'blog2', name: "Blog 2"});
      post1 = blog1.blogPosts().createFromRemote({id: 'post1', body: "this is post 1"});
      post2 = blog1.blogPosts().createFromRemote({id: 'post2', body: "this is post 2"});
      post3 = blog2.blogPosts().createFromRemote({id: 'post3', body: "this is post 3"});
      Server.save(user, blog1, blog2, post1, post2, post3);

      operand = user.blogs().join(BlogPost).on(BlogPost.blogId.eq(Blog.id));
      projection = new Monarch.Model.Relations.TableProjection(operand, Blog.table);
    });


    describe("#allTuples", function() {
      it("returns all unique records corresponding to the projected table", function() {
        var allTuples = projection.allTuples();
        expect(allTuples.length).to(eq, 2);
        expect(_.include(allTuples, blog1)).to(beTrue);
        expect(_.include(allTuples, blog2)).to(beTrue);
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
        projection.onRemoteInsert(insertCallback);
        projection.onRemoteUpdate(updateCallback);
        projection.onRemoteRemove(removeCallback);
      });

      describe("when a tuple is inserted into the operand", function() {
        context("if the record corresponding to the projected table is NOT already present in the projection", function() {
          it("triggers onRemoteInsert callbacks with the record", function() {
            var blog = user.blogs().createFromRemote({id: 'bloggo'});
            var post = blog.blogPosts().createFromRemote();
            Server.save(blog, post);
            expect(insertCallback).to(haveBeenCalled, once);
            expect(insertCallback).to(haveBeenCalled, withArgs(blog));
          });
        });

        context("if the record corresponding to the projected table is already present in the projection", function() {
          it("does not trigger an on insert callback", function() {
            blog1.blogPosts().create();
            expect(insertCallback).toNot(haveBeenCalled);
          });
        });
      });

      describe("when a record is updated in the operand", function() {
        context("if one of the updated columns is in the #projectedTable", function() {
          it("triggers onRemoteUpdate callbacks with the record's corresponding projected record and the changed columns", function() {
            var oldValue = blog2.name();
            var newValue = "I feeeel good!";

            blog2.update({name: newValue});

            expect(updateCallback).to(haveBeenCalled, once);
            expect(updateCallback).to(haveBeenCalled, withArgs(blog2, {
              name: {
                column: Blog.name_,
                oldValue: oldValue,
                newValue: newValue
              },
              funProfitName: {
                column: Blog.funProfitName,
                oldValue: oldValue + " for Fun and Profit",
                newValue: newValue + " for Fun and Profit"
              }
            }));
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
          it("triggers onRemoteRemove callbacks with the removed record's corresponding projected record", function() {
            post3.destroy();
            expect(removeCallback).to(haveBeenCalled, withArgs(blog2));
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

    describe("subscription propagation", function() {

    });
  });
}});
