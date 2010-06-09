//= require "../../hyperarchy_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Views.EditOrganization", function() {
    var view;
    before(function() {
      view = Views.EditOrganization.toView();
    });

    describe("#populateAutocomplete(searchString, callback)", function() {
      useFakeServer();
      
      it("sends the non-bracketed portion of the string to /autocomplete_members, then invokes the callback with the result", function() {
        var callback = mockFunction("callback")
        view.populateAutocomplete({ term: "Nath  <nathan@gmail.com>" }, callback);

        expect(Server.gets.length).to(eq, 1);
        expect(Server.lastGet.url).to(eq, "/autocomplete_members");
        expect(Server.lastGet.data).to(equal, {
          search_string: "Nath"
        });

        var results = ["Nathan Sobo <nathan@example.com>", "Nathan Smith <nath@example.com>"];
        Server.lastGet.simulateSuccess({ results: results });

        expect(callback).to(haveBeenCalled, once);
        expect(callback).to(haveBeenCalled, withArgs(results));
      });
    });
  });
}});
