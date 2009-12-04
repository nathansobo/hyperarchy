var Pusher = {
  Version: '1.0'
};

/*
File: Math.uuid.js
Version: 1.3
Change History:
  v1.0 - first release
  v1.1 - less code and 2x performance boost (by minimizing calls to Math.random())
  v1.2 - Add support for generating non-standard uuids of arbitrary length
  v1.3 - Fixed IE7 bug (can't use []'s to access string chars.  Thanks, Brian R.)
  v1.4 - Changed method to be "Math.uuid". Added support for radix argument.  Use module pattern for better encapsulation.

Latest version:   http://www.broofa.com/Tools/Math.uuid.js
Information:      http://www.broofa.com/blog/?p=151
Contact:          robert@broofa.com
----
Copyright (c) 2008, Robert Kieffer
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    * Neither the name of Robert Kieffer nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
Math.uuid = (function() {
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  return function (len, radix) {
    var chars = CHARS, uuid = [], rnd = Math.random;
    radix = radix || chars.length;

    if (len) {
      for (var i = 0; i < len; i++) uuid[i] = chars[0 | rnd()*radix];
    } else {
      var r;

      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      for (var i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | rnd()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
        }
      }
    }

    return uuid.join('');
  };
})();

var randomUUID = Math.uuid;
Pusher.Transport = Class.create({
  CONNECT_DELAY: 0.5, //sec
  RECONNECT_DELAY: 3, //sec

  initialize: function(url, channelId, callback) {
    this.sessionId = Math.uuid(12);
    this.channelId = channelId;

    var params = Object.toQueryString({ transport: this.name,
                                        channel_id: this.channelId,
                                        session_id: this.sessionId });
    this.url = url + (url.include('?') ? '&' : '?') + params;

    this.callback = callback;
    this.connect.bind(this).delay(this.CONNECT_DELAY);
  },

  name: null,

  connect: Prototype.emptyFunction,

  reconnect: function() {
    this.connect.bind(this).delay(this.RECONNECT_DELAY);
  }
});

Pusher.LongPoll = Class.create(Pusher.Transport, {
  name: "long_poll",

  connect: function() {
    var self = this;

    new Ajax.Request(this.url, {
      method: 'get',

      onCreate: function(response) {
        if (Prototype.Browser.WebKit)
          response.request.transport.onerror = self.reconnect.bind(self);
      },

      onComplete: function(transport) {
        if (transport.status == 0) {
          self.reconnect();
        } else {
          var data = transport.responseText.strip();
          if (data.length > 0)
            self.callback(data);
          self.connect.bind(self).defer();
        }
      }
    });
  }
});
Pusher.XhrStream = Class.create(Pusher.Transport, {
  name: "xhr_stream",

  connect: function() {
    var len = 0;
    var self = this;

    new Ajax.Request(this.url, {
      method: 'get',

      onCreate: function(response) {
        if (Prototype.Browser.WebKit)
          response.request.transport.onerror = self.reconnect.bind(self);
      },

      onInteractive: function(transport) {
        var data = transport.responseText.slice(len).strip();
        len = transport.responseText.length;
        if (data.length > 0) self.callback(data);
      },

      onComplete: function() {
        self.reconnect()
      }
    });
  }
});
Pusher.SSE = Class.create(Pusher.Transport, {
  name: "sse",

  connect: function() {
    var tag = document.createElement('event-source');
    tag.setAttribute("src", this.url);

    if (opera.version() < 9.5) {
      document.body.appendChild(tag);
    }

    var self = this;
    $(tag).observe("message", function(e) {
      var data = e.data.strip();
      if (data.length > 0)
        self.callback(data);
    })
  }
});
Pusher.HtmlFile = Class.create(Pusher.Transport, {
  name: "html_file",

  connect: function() {
    alert("Not working on IE yet!");
  }
});

if (Prototype.Browser.WebKit || Prototype.Browser.Gecko) {
  Pusher.Client = Pusher.XhrStream;
} else if (Prototype.Browser.Opera) {
  Pusher.Client = Pusher.SSE;
} else if (Prototype.Browser.IE) {
  Pusher.Client = Pusher.HtmlFile;
} else {
  Pusher.Client = Pusher.LongPoll;
}
