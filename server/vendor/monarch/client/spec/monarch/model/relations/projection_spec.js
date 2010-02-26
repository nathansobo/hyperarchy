//= require "../../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Model.Relations.Projection", function() {
    use_local_fixtures();
    
    var operand, projected_columns, projection;
    before(function() {
      operand = Blog.table;
      projected_columns = [new Monarch.Model.ProjectedColumn(Blog.user_id), Blog.name_.as('blog_name')];
      projection = new Monarch.Model.Relations.Projection(operand, projected_columns);
    });


    describe("#tuples", function() {
      it("returns ProjectedTuples with fields corresponding only to the #projected_columns", function() {
        var projection_tuples = projection.tuples();
        var operand_tuples = operand.tuples();

        expect(projection_tuples).to_not(be_empty);
        expect(projection_tuples.length).to(equal, operand_tuples.length);

        Monarch.Util.each(operand.tuples(), function(operand_record, index) {
          var projection_record = projection_tuples[index];
          expect(projection_record.user_id()).to(equal, operand_record.user_id());
          expect(projection_record.field(projection.column('blog_name')).value()).to(equal, operand_record.name());
          expect(projection_record.field('blog_name').value()).to(equal, operand_record.name());
          expect(projection_record.started_at).to(be_null);
        });
      });
    });


    describe("event handling", function() {
      var insert_callback, update_callback, remove_callback;
      before(function() {
        insert_callback = mock_function("insert_callback");
        update_callback = mock_function("update_callback");
        remove_callback = mock_function("remove_callback");
        projection.on_remote_insert(insert_callback);
        projection.on_remote_update(update_callback);
        projection.on_remote_remove(remove_callback);
      });

      describe("when a record is inserted into the operand", function() {
        it("triggers on_remote_insert callbacks with the inserted record's corresponding ProjectionRecord", function() {
          var operand_record = operand.create({name: "Radio Flyer"});

          expect(insert_callback).to(have_been_called, once);
          expect(insert_callback.most_recent_args[0].blog_name()).to(equal, "Radio Flyer");
          expect(projection.find(projection.column('blog_name').eq("Radio Flyer"))).to(equal, insert_callback.most_recent_args[0]);
        });
      });

      describe("when a record is updated in the operand", function() {
        context("if any of the updated columns are in #projected_columns", function() {
          it("triggers on_remote_update callbacks with the record's corresponding ProjectionRecord and the changed columns", function() {
            var operand_record = operand.find('motorcycle');
            var old_name = operand_record.name();
            var projection_record = projection.find(projection.column('blog_name').eq(operand_record.name()));
            expect(projection_record).to_not(be_null);
            
            operand_record.update({name: "Motorcycles: Wheee!"});

            expect(update_callback).to(have_been_called, with_args(projection_record, {
              blog_name: {
                column: projection.column('blog_name'),
                old_value: old_name,
                new_value: "Motorcycles: Wheee!"
              }
            }));
          });
        });

        context("if none of the updated columns are in #projected_columns", function() {
          it("does not trigger any callbacks", function() {
            var operand_record = operand.find('motorcycle');

            operand_record.local_update({started_at: new Date()});

            expect(update_callback).to_not(have_been_called, once);
          });
        });
      });

      describe("when a record is removed from the operand", function() {
        it("triggers on_remote_remove callbacks with the removed record's corresponding ProjectionRecord", function() {
          var operand_record = operand.find('motorcycle');
          var projection_record = projection.find(projection.column('blog_name').eq(operand_record.name()));
          operand.remove(operand_record);

          expect(remove_callback).to(have_been_called, with_args(projection_record));
        });
      });
    });
  });
}});
