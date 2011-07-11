//= require monarch_spec_helper

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
        var connectCallback = mockFunction('connectCallback');

        client.onReceive(receiveCallback);
        client.connect().success(connectCallback);

        expect(jQuery.ajax).to(haveBeenCalled, once);

        mockXhr.readyState = 3;
        mockXhr.responseText = '["connected"]\n{"foo": 1}\n'
        mockXhr.onreadystatechange();

        expect(connectCallback).to(haveBeenCalled, once);
        expect(receiveCallback).to(haveBeenCalled, once);
        expect(receiveCallback).to(haveBeenCalled, withArgs({'foo': 1}));

        receiveCallback.clear();

        // does not attempt to process incomplete line fragments
        mockXhr.responseText = '["connected"]\n{"foo": 1}\n{"bar": 2}\n{"baz:'
        mockXhr.onreadystatechange();
        expect(receiveCallback).to(haveBeenCalled, once);
        expect(receiveCallback).to(haveBeenCalled, withArgs({'bar': 2}));

        receiveCallback.clear();

        mockXhr.responseText = '["connected"]\n{"foo": 1}\n{"bar": 2}\n{"baz": 3}\n{"quux": 4}\n'
        mockXhr.onreadystatechange();
        expect(receiveCallback).to(haveBeenCalled, twice);
        expect(receiveCallback.callArgs[0]).to(equal, [{'baz': 3}]);
        expect(receiveCallback.callArgs[1]).to(equal, [{'quux': 4}]);

        receiveCallback.clear();

        // empty lines don't cause problems
        mockXhr.responseText = '["connected"]\n{"foo": 1}\n{"bar": 2}\n{"baz": 3}\n{"quux": 4}\n\n\n\n'
        mockXhr.onreadystatechange();
        expect(receiveCallback).toNot(haveBeenCalled);

        mockXhr.responseText = '["connected"]\n{"foo": 1}\n{"bar": 2}\n{"baz": 3}\n{"quux": 4}\n\n\n\n{"zoo": 5}\n'
        mockXhr.onreadystatechange();
        expect(receiveCallback).to(haveBeenCalled, once);
        expect(receiveCallback).to(haveBeenCalled, withArgs({'zoo': 5})); 
      });

      it("upon disconnection, will attempt to connect again immediately, retry after 1 second if the reconnect fails, and invoke onDisconnect handlers if the retry fails", function() {
        var mockXhr = {};
        var mockedNowMilliseconds = new Date().getTime();

        mock(client, 'nowMilliseconds', function() {
          return mockedNowMilliseconds;
        });

         // don't actually delay, just move mock time forward and call
        mock(_, 'delay', function(f, delay) {
          mockedNowMilliseconds += delay;
          f();
        });
        mock(jQuery, 'ajax', function() {
          return mockXhr;
        });

        var disconnectCallback = mockFunction('receiveCallback');

        client.onDisconnect(disconnectCallback);
        client.connect();

        expect(jQuery.ajax).to(haveBeenCalled, once);

        _.delay.clear();
        jQuery.ajax.clear();

        // simulate disconnection
        mockXhr.readyState = 4;
        mockXhr.onreadystatechange();

        // should retry immediately
        expect(_.delay.mostRecentArgs[1]).to(eq, 20);
        expect(jQuery.ajax).to(haveBeenCalled, once);

        _.delay.clear();
        jQuery.ajax.clear();

        // simulate failure of retry attempt
        mockXhr.readyState = 4;
        mockXhr.onreadystatechange();

        // should now retry in 1 second
        expect(_.delay.mostRecentArgs[1]).to(eq, 2500);
        expect(jQuery.ajax).to(haveBeenCalled, once);

        _.delay.clear();
        jQuery.ajax.clear();

        
        expect(disconnectCallback).toNot(haveBeenCalled);

        // simulate another failure of second retry attempt
        mockXhr.readyState = 4;
        mockXhr.onreadystatechange();

        // should not retry. should invoke disconnect handler
        expect(jQuery.ajax).toNot(haveBeenCalled);
        expect(disconnectCallback).to(haveBeenCalled, once);
      });


      it("if the client has been disconnected for more than 4 seconds, does not attempt to reconnect", function() {
        var mockXhr = {};
        var mockedNowMilliseconds = new Date().getTime();

        mock(client, 'nowMilliseconds', function() {
          return mockedNowMilliseconds;
        });

         // don't actually delay, just move mock time forward and call
        mock(_, 'delay', function(f, delay) {
          mockedNowMilliseconds += delay;
          f();
        });
        mock(jQuery, 'ajax', function() {
          return mockXhr;
        });

        var disconnectCallback = mockFunction('receiveCallback');

        client.onDisconnect(disconnectCallback);
        client.connect();

        expect(jQuery.ajax).to(haveBeenCalled, once);
        mockXhr.readyState = 3;
        mockXhr.responseText = "[\"connected\"]\n"
        mockXhr.onreadystatechange();

        _.delay.clear();
        jQuery.ajax.clear();

        // call recordConnectionStatus manually, because it will be on a periodic timer every second
        mockedNowMilliseconds += 1000;
        client.recordConnectionStatus();
        mockedNowMilliseconds += 1000;
        client.recordConnectionStatus();

        // now simulate time passing without recording connection status, like the computer was put to sleep
        mockedNowMilliseconds += 5000;

        // simulate detection of disconnection
        mockXhr.readyState = 4;
        mockXhr.onreadystatechange();

        expect(jQuery.ajax).toNot(haveBeenCalled);
        expect(disconnectCallback).to(haveBeenCalled, once);
      });
    });
  });
}});
