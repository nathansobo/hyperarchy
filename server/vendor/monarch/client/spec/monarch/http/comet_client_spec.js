//= require "../../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.Http.CometClient", function() {
    var client;
    before(function() {
      client = new Monarch.Http.CometClient();
    });
    
    describe("#connect()", function() {
      it("starts a streaming XHR request to the comet hub, which parses input as json line at a time and invokes the receive handler with it", function() {
        var mockXhr = {};
        mock(_, 'delay', function(f) { f(); }); // don't actually delay
        mock(jQuery, 'ajax', function() {
          return mockXhr;
        });

        var receiveCallback = mockFunction('receiveCallback');

        client.onReceive(receiveCallback);
        client.connect();

        expect(jQuery.ajax).to(haveBeenCalled, once);

        mockXhr.readyState = 3;
        mockXhr.responseText = '{"foo": 1}\n'
        mockXhr.onreadystatechange();

        expect(receiveCallback).to(haveBeenCalled, once);
        expect(receiveCallback).to(haveBeenCalled, withArgs({'foo': 1}));

        receiveCallback.clear();

        // does not attempt to process incomplete line fragments
        mockXhr.responseText = '{"foo": 1}\n{"bar": 2}\n{"baz:'
        mockXhr.onreadystatechange();
        expect(receiveCallback).to(haveBeenCalled, once);
        expect(receiveCallback).to(haveBeenCalled, withArgs({'bar': 2}));

        receiveCallback.clear();

        mockXhr.responseText = '{"foo": 1}\n{"bar": 2}\n{"baz": 3}\n{"quux": 4}\n'
        mockXhr.onreadystatechange();
        expect(receiveCallback).to(haveBeenCalled, twice);
        expect(receiveCallback.callArgs[0]).to(equal, [{'baz': 3}]);
        expect(receiveCallback.callArgs[1]).to(equal, [{'quux': 4}]);

        receiveCallback.clear();

        // empty lines don't cause problems
        mockXhr.responseText = '{"foo": 1}\n{"bar": 2}\n{"baz": 3}\n{"quux": 4}\n\n\n\n'
        mockXhr.onreadystatechange();
        expect(receiveCallback).toNot(haveBeenCalled);

        mockXhr.responseText = '{"foo": 1}\n{"bar": 2}\n{"baz": 3}\n{"quux": 4}\n\n\n\n{"zoo": 5}\n'
        mockXhr.onreadystatechange();
        expect(receiveCallback).to(haveBeenCalled, once);
        expect(receiveCallback).to(haveBeenCalled, withArgs({'zoo': 5})); 
      });
    });
  });
}});
