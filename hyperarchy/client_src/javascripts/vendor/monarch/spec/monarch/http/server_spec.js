//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Http.Server", function() {
    var requests, server;

    before(function() {
      requests = [];
      mock(jQuery, 'ajax', function(request) {
        requests.push(request)
      });

      server = new Monarch.Http.Server();
      server.sandboxUrl = '/sandbox';
    });

    describe("#fetch", function() {
      useExampleDomainModel();

      it("sends a GET request to the sandbox url and puts the resulting records in the repository before firing callbacks on the returned promise", function() {
        var promise = server.fetch(Blog, BlogPost);
        expect(requests.length).to(eq, 1);
        var request = requests[0];

        expect(request.url).to(eq, '/sandbox');
        expect(request.type).to(eq, 'get');
        expect(request.data).to(equal, {
          relations: JSON.stringify([Blog.wireRepresentation(), BlogPost.wireRepresentation()])
        });

        var successCallback = mockFunction("successCallback", function() {
          expect(Blog.find(1)).toNot(beNull);
          expect(BlogPost.find(1)).toNot(beNull);
        });
        var errorCallback = mockFunction("errorCallback");
        promise.onSuccess(successCallback);
        promise.onError(errorCallback);

        request.success({
          'blogs': {
            '1': {
              id: 1,
              name: "Blog 1",
              user_id: 1,
              started_at: 1302069325319
            }
          },
          'blog_posts': {
            '1': {
              id: 1,
              name: "Blog 1 Post 1",
              blog_id: 1
            }
          }
        });
        
        expect(successCallback).to(haveBeenCalled);
        expect(errorCallback).toNot(haveBeenCalled);
      });

      it("fires error callbacks on the returned promise in the event of an error", function() {
        var promise = server.fetch(Blog, BlogPost);
        var successCallback = mockFunction("successCallback");
        var errorCallback = mockFunction("errorCallback");
        promise.onSuccess(successCallback);
        promise.onError(errorCallback);

        requests[0].error("jqXhr", "error", "errorThrown");

        expect(errorCallback).to(haveBeenCalled, withArgs("jqXhr", "error", "errorThrown"));
        expect(successCallback).toNot(haveBeenCalled);
      });
    });
  });
}});
