//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Http.Server", function() {
    useExampleDomainModel();
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

    describe("#create", function() {
      var record;

      before(function() {
        record = User.build({ fullName: "Jesus Chang", age: 22, signedUpAt: 1302070303036 });
      });
      
      it("sends a POST request to the sandbox url corresponding to the given record's table with its field values", function() {
        server.create(record);
        expect(requests.length).to(eq, 1);
        var request = requests[0];

        expect(request.type).to(eq, 'post');
        expect(request.url).to(eq, '/sandbox/users');
        expect(request.data).to(equal, {
          field_values: record.wireRepresentation()
        });
      });

      context("when the creation is successful", function() {
        it("updates the record with the server's field values and inserts it into the repository", function() {
          server.create(record);
          requests[0].success({
            id: 22,
            full_name: "Jesus H. Chang",
            age: 23,
            signed_up_at: 1302070303036
          });

          expect(User.find(22)).to(eq, record);
          expect(record.fullName()).to(eq, "Jesus H. Chang");
          expect(record.age()).to(eq, 23);
          expect(record.signedUpAt().getTime()).to(eq, 1302070303036);
        });

        it("fires insert/create callbacks on the table/record, and success callbacks registered on the returned promise", function() {
          var promise = server.create(record);

          var insertCallback = mockFunction('insertCallback', function() {
            expect(User.find(22)).to(eq, record);
          });
          User.onInsert(insertCallback);

          var createCallback = mockFunction('createCallback', function() {
            expect(User.find(22)).to(eq, record);
          });
          record.onCreate(createCallback);

          var successCallback = mockFunction('successCallback', function() {
            expect(User.find(22)).to(eq, record);
          });
          promise.onSuccess(successCallback);

          requests[0].success({ id: 22 });

          expect(insertCallback).to(haveBeenCalled);
          expect(insertCallback.mostRecentArgs[0]).to(eq, record); // other args relate to sort index and are tested elsewhere
          expect(createCallback).to(haveBeenCalled);
          expect(successCallback).to(haveBeenCalled, withArgs(record));
        });
      });

      context("when the creation results in a validation error", function() {

      });

      context("when the creation results in an error not pertaining to validation", function() {

      });
    });
  });
}});
