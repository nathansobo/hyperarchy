//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Model.Repository", function() {
    define_model_fixtures();

    var Repository;
    before(function() {
      Repository = Model.Repository;
    });

    describe(".remote_create", function() {
      it("calls Server.post with #origin_url and json to create a Record with the given field values in the given Relation", function() {
        Repository.origin_url = "/users/steph/repository";
        var future = Repository.remote_create(Animal.table, {name: 'Keefa'});
        expect(Server.posts).to(have_length, 1);

        var post = Server.posts.shift();
        expect(post.url).to(equal, Repository.origin_url);
        expect(post.data).to(equal, {
          relation: Animal.table.wire_representation(),
          field_values: {name: 'Keefa'}
        });

        mock(future, 'handle_response');
        post.simulate_success({id: 'keefa', name: 'Keefa'});
      });
    });
  });
}});