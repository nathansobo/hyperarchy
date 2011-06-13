//= require monarch_spec_helper

Screw.Unit(function(c) { with(c) {
  describe("custom ajax dataType converters", function() {
    mockLowLevelXhr();
    useExampleDomainModel();

    describe("handling requests with the 'records' dataType", function() {
      it("updates the repository with the returned records before invoking the success callback", function() {
        var successCallback = mockFunction('successCallback', function() {
          expect(User.find(1).fullName()).to(eq, "Adam Smith");
          expect(Blog.find(1).name()).to(eq, "Blog 1");
          expect(Blog.find(2).name()).to(eq, "Blog 2");
        });

        jQuery.ajax({
          url: '/resource',
          dataType: 'records',
          success: successCallback
        });

        var recordsHash = {
          'users': {
            '1': {
              id: 1,
              fullName: "Adam Smith"
            }
          },
          'blogs': {
            '1': { id: 1, name: "Blog 1" },
            '2': { id: 2, name: "Blog 2" }
          }
        };

        requests[0].response({
          status: 200,
          contentType: 'application/json',
          responseText: JSON.stringify(recordsHash)
        });

        expect(successCallback).to(haveBeenCalled);
      });

      it("updates the repository with the returned records before invoking the success callback", function() {
        var successCallback = mockFunction('successCallback', function() {
          expect(User.find(99)).to(beUndefined);
          expect(User.find(1).fullName()).to(eq, "Adam Smith");
          expect(Blog.find(1).name()).to(eq, "Blog 1");
          expect(Blog.find(2).name()).to(eq, "Blog 2");
        });

        User.createFromRemote({id: 99});

        jQuery.ajax({
          url: '/resource',
          dataType: 'records!',
          success: successCallback
        });

        expect(User.find(99)).toNot(beUndefined);

        var recordsHash = {
          'users': {
            '1': {
              id: 1,
              fullName: "Adam Smith"
            }
          },
          'blogs': {
            '1': { id: 1, name: "Blog 1" },
            '2': { id: 2, name: "Blog 2" }
          }
        };

        requests[0].response({
          status: 200,
          contentType: 'application/json',
          responseText: JSON.stringify(recordsHash)
        });

        expect(successCallback).to(haveBeenCalled);
      });
    });

    describe("handling requests with the 'data+records' dataType", function() {
      it("updates the repository with the records returned under the top-level 'records' key, then invokes callbacks with the 'data' key", function() {
        var successCallback = mockFunction('successCallback', function() {
          expect(User.find(1).fullName()).to(eq, "Adam Smith");
          expect(Blog.find(1).name()).to(eq, "Blog 1");
          expect(Blog.find(2).name()).to(eq, "Blog 2");
        });

        jQuery.ajax({
          url: '/resource',
          dataType: 'data+records',
          success: successCallback
        });

        var data = {
          foo: [1, 2],
          bar: "baz"
        };

        var responseJson = {
          data: data,
          records: {
            users: {
              1: { id: 1, fullName: "Adam Smith" }
            },
            blogs: {
              1: { id: 1, name: "Blog 1" },
              2: { id: 2, name: "Blog 2" }
            }
          }
        };

        requests[0].response({
          status: 200,
          contentType: 'application/json',
          responseText: JSON.stringify(responseJson)
        });

        expect(successCallback).to(haveBeenCalled);
        expect(successCallback.mostRecentArgs[0]).to(equal, data);
      });
    });

    describe("handling requests with the 'data+records!' dataType", function() {
      it("clears the repository, then updates it as normal before invoking callbacks with the 'data' key", function() {
        var successCallback = mockFunction('successCallback', function() {
          expect(User.find(99)).to(beUndefined);
          expect(User.find(1).fullName()).to(eq, "Adam Smith");
          expect(Blog.find(1).name()).to(eq, "Blog 1");
          expect(Blog.find(2).name()).to(eq, "Blog 2");
        });

        User.createFromRemote({id: 99});

        jQuery.ajax({
          url: '/resource',
          dataType: 'data+records!',
          success: successCallback
        });

        var data = {
          foo: [1, 2],
          bar: "baz"
        };

        var responseJson = {
          data: data,
          records: {
            users: {
              1: { id: 1, fullName: "Adam Smith" }
            },
            blogs: {
              1: { id: 1, name: "Blog 1" },
              2: { id: 2, name: "Blog 2" }
            }
          }
        };

        requests[0].response({
          status: 200,
          contentType: 'application/json',
          responseText: JSON.stringify(responseJson)
        });

        expect(successCallback).to(haveBeenCalled);
        expect(successCallback.mostRecentArgs[0]).to(equal, data);
      });
    });
  });

  describe("jQuery.fn.appendView", function() {
    var view;

    before(function() {
      view = Monarch.View.build(function(b) {
        b.div(function() {
          b.div({id: "foo"});
          b.div({id: "bar"});
        })
      });
    });

    it("constructs an anonymous template with the given function as its content method, then generates a view with it, passing this.builder to the function, and appends it to the current jQuery element", function() {
      var clickCallback = mockFunction("click callback");
      view.find("div#bar").appendView(function(b) {
        b.div({id: "baz"}, "baz").click(clickCallback);
      });
      
      view.find("div#bar > div#baz").click();
      expect(clickCallback).to(haveBeenCalled);
    });
  });

  describe("jQuery.fn.view", function() {
    after(function() {
      $("#testContent").empty();
    });

    it("returns the view object associated with a DOM node", function() {
      var view = Monarch.View.build(function(b) {
        b.div("testing");
      });

      $("#testContent").append(view);
      var newWrapper = $("#testContent").find("div");
      expect(newWrapper.view()).to(eq, view);
    });
  });

  describe("jQuery.fn.fieldValues()", function() {
    var view;
    before(function() {
      view = Monarch.View.build(function(b) { with(b) {
        div(function() {
          input({name: "foo", value: "Foo"}).ref('foo');
          input({name: "hidden", value: "baz", style: "display: none;"}).ref('hiddenField');
          input({name: "bar", value: "Bar"}).ref('bar');
          input({name: "baz", type: "checkbox", checked: false}).ref('baz');
          input({value: "Do not include because I have no name"});
          textarea({name: 'textarea'}, "This too");

          select({name: "quux"}, function() {
            option({value: "1"});
            option({value: "2", selected: 1});
            option({value: "3"});
          }).ref('quux');
        });
      }});

      $("#testContent").html(view);
    });

    after(function() {
      $("#testContent").empty();
    });

    it("returns a hash of name value pairs for all input elements on the view", function() {
      expect(view.fieldValues()).to(equal, {
        foo: "Foo",
        bar: "Bar",
        baz: false,
        textarea: "This too",
        quux: '2'
      });
    });

    it("if a customFieldValues method is present, merges its results into the returned fieldValues", function() {
      view.customFieldValues = function() {
        return {
          corge: "hi there"
        }
      }
      expect(view.fieldValues()).to(equal, {
        foo: "Foo",
        bar: "Bar",
        baz: false,
        quux: '2',
        textarea: "This too",
        corge: "hi there"
      });
    });
  });

  describe("jQuery.fn.bindText(record, fieldName)", function() {
    useExampleDomainModel();

    it("assigns the html of the current jquery-wrapped element to the value of the indicated field, and keeps it updated as the field changes remotely", function() {
      var elt = $("<div></div>");
      var blog = Blog.createFromRemote({id: "blog", name: "Arcata Tent Haters & Lovers"})
      elt.bindText(blog, "name");
      expect(elt.html()).to(eq, "Arcata Tent Haters &amp; Lovers");

      blog.remotelyUpdated({name: "Arcata Tent Lovers"});
      expect(elt.html()).to(eq, "Arcata Tent Lovers");

      var blog2 = Blog.createFromRemote({id: "blog", name: "Arcata Naan <Lovers>"});
      elt.bindText(blog2, "name");

      expect(elt.html()).to(eq, "Arcata Naan &lt;Lovers&gt;");

      blog.name("Arcata Tent Burners");
      expect(elt.html()).to(eq, "Arcata Naan &lt;Lovers&gt;");
    });

    it("if the containing view is removed, destroys the subscription", function() {
      var blog = Blog.createFromRemote({id: "blog", name: "Arcata Tent Haters"});

      var view = Monarch.View.build(function(b) {
          b.div(function() {
            b.h1().ref("h1");
          })
        }
      );

      view.h1.bindText(blog, 'name');
      expect(view.h1.html()).to(eq, "Arcata Tent Haters");

      view.remove();
      blog.name("Arcata Tent Lovers");
      expect(view.h1.html()).to(eq, "Arcata Tent Haters");
    });
  });
}});
