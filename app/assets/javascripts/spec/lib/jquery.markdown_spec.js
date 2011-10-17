//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

describe("jQuery markdown extensions", function() {
  describe("jQuery.fn.markdown", function() {
    var view;
    beforeEach(function() {
      view = $('<div></div>');
    });

    it("populates html with the given string after converting it from markdown", function() {
      view.markdown("I just **love** your _cupcakes!_");
      expect(view.html()).toBe("<p>I just <strong>love</strong> your <em>cupcakes!</em></p>");
    });

    it("strips out any html tags before converting to markdown", function() {
      view.markdown("I just **love** your <a href='http://poison.com'>poison</a> _cupcakes!_");
      expect(view.html()).toBe("<p>I just <strong>love</strong> your poison <em>cupcakes!</em></p>");
    });

    it("converts raw urls into links", function() {
      view.markdown("http://poison.com");
      expect(view.html()).toBe('<p><a class="link" href="http://poison.com">http://poison.com</a></p>');
    });

    it("correctly deals with markdown links", function() {
      view.markdown('[Delicious Poison](http://poison.com)');


      expect(view.html()).toBe('<p><a href="http://poison.com">Delicious Poison</a></p>');
    });
  });

  describe("jQuery.fn.bindMarkdown(record, fieldName)", function() {
    it("assigns the html of the current jquery-wrapped element to the value of the indicated field, and keeps it updated as the field changes remotely", function() {
      var elt = $("<div></div>");
      var org = Organization.createFromRemote({id: 1, name: "Arcata *Tent* Haters & Lovers"})
      elt.bindMarkdown(org, "name");
      expect(elt.html()).toBe("<p>Arcata <em>Tent</em> Haters &amp; Lovers</p>");

      org.remotelyUpdated({name: "Arcata Tent *Lovers*"});
      expect(elt.html()).toBe("<p>Arcata Tent <em>Lovers</em></p>");

      var org2 = Organization.createFromRemote({id: 2, name: "Arcata Naan Lovers"});
      elt.bindMarkdown(org2, "name");

      expect(elt.html()).toBe("<p>Arcata Naan Lovers</p>");

      org.name("Arcata Tent Burners");
      expect(elt.html()).toBe("<p>Arcata Naan Lovers</p>");
    });

    it("if the containing view is removed, destroys the subscription (but does not if it's only _detached_)", function() {
      var org = Organization.createFromRemote({id: "blog", name: "Arcata Tent Haters"});

      var view = Monarch.View.build(function(b) {
          b.div(function() {
            b.h1().ref("h1");
          })
        }
      );

      view.h1.bindMarkdown(org, 'name');
      expect(view.h1.html()).toBe("<p>Arcata Tent Haters</p>");

      view.detach();
      org.remotelyUpdated({name: "Arcata Goat Haters. NIMBY."});
      expect(view.h1.html()).toBe("<p>Arcata Goat Haters. NIMBY.</p>");

      view.remove();
      org.remotelyUpdated({name: "Arcata Goat Lovers"});
      expect(view.h1.html()).toBe("<p>Arcata Goat Haters. NIMBY.</p>");
    });
  });

});



