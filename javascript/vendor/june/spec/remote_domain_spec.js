require("/specs/june_spec_helper");

Screw.Unit(function(c) { with(c) {
  describe("RemoteDomain", function() {
    var remote;
    before(function() {
      remote = new June.RemoteDomain("/domain");
    });

    describe("#pull", function() {
      it("calls #update on June.GlobalDomain with the results of #fetch", function() {
        var snapshot = {
          "users": {
            "stephanie": {
              "id": "stephanie",
              "first_name": "Stephanie"
            }
          }
        };
        mock(remote, "fetch", function() {
          return snapshot;
        });

        var callback = function() {}
        mock(June.GlobalDomain, "update");
        remote.pull([User], callback);
        expect(June.GlobalDomain.update).to(have_been_called, with_args(snapshot, callback));
      });
    });

    describe("#fetch", function() {
      it("sends a GET request to the RemoteDomain's url with a JSON wire representation of the given relations and returns a JSON snapshot of its results", function() {
        var mock_server_response = {
          'users': {
            'jan': {
              'id': 'jan'
            }
          }
        }

        mock(jQuery, "ajax", function() {
          return JSON.stringify(mock_server_response);
        });

        var users = User.where(User.age.eq(21));
        var pets = users.join(Pet).on(Pet.owner_id.eq(User.id)).project(User);

        var snapshot = remote.fetch(users, pets);
        expect(snapshot).to(equal, mock_server_response);

        expect(jQuery.ajax).to(have_been_called, once);
        var ajax_hash = jQuery.ajax.most_recent_args[0]

        expect(ajax_hash.url).to(equal, remote.url);
        expect(ajax_hash.type).to(equal, "GET");
        expect(ajax_hash.data.relations).to(equal, [users.wire_representation(), pets.wire_representation()]);

      });
    });
  });
}});