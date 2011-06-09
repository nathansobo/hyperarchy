describe("Views.Layout.AccountMenu", function() {
  var accountMenu;
  beforeEach(function() {
    $("#jasmine_content").html(window.Application = Views.Layout.toView());
    Application.attach();
    accountMenu = Application.accountMenu;
    expect(accountMenu).toExist();
  });

  describe("when a current user is assigned", function() {
    var guest, member;

    beforeEach(function() {
      guest = User.createFromRemote({id: 1, guest: true, firstName: "Guest", lastName: "User"});
      member = User.createFromRemote({id: 2, guest: false, firstName: "Joe", lastName: "Member", emailHash: 'fake-email-hash'});
    });

    describe("when the assigned user is a guest", function() {
      beforeEach(function() {
        Application.currentUser(member);
        expect(accountMenu.loginLink).toBeHidden();
        expect(accountMenu.dropdownLink).toBeVisible();
        Application.currentUser(guest);
      });

      it("shows the login link", function() {
        expect(accountMenu.dropdownLink).toBeHidden();
        expect(accountMenu.loginLink).toBeVisible();
      });

      describe("when the login link is clicked", function() {
        it("shows the the login form", function() {
          accountMenu.loginLink.click();
          expect(Application.loginForm).toBeVisible();
        });
      });
    });

    describe("when the assigned user is a non-guest", function() {
      beforeEach(function() {
        Application.currentUser(guest);
        expect(accountMenu.dropdownLink).toBeHidden();
        expect(accountMenu.loginLink).toBeVisible();
        Application.currentUser(member);
      });

      it("shows the current user's name and avatar", function() {
        expect(accountMenu.loginLink).toBeHidden();
        expect(accountMenu.dropdownLink).toBeVisible();
        expect(accountMenu.avatar.attr('src')).toEqual(member.gravatarUrl(25));
        expect(accountMenu.name.html()).toEqual(member.fullName());
      });

      describe("showing and hiding of the dropdown menu", function() {
        it("shows the dropdown menu when it is clicked, then hides it when the user clicks again anywhere", function() {
          clickDropdownLink();

          runs(function() {
            expect(accountMenu.dropdown).toBeVisible();
            $(window).click();
            expect(accountMenu.dropdown).toBeHidden();
          });
        });

        it("hides the dropdown menu when the user clicks the dropdown link again, but allows it to be opened with the next click", function() {
          clickDropdownLink();

          runs(function() {
            expect(accountMenu.dropdown).toBeVisible();
          });

          clickDropdownLink();

          runs(function() {
            expect(accountMenu.dropdown).toBeHidden();
          });

          clickDropdownLink();

          runs(function() {
            expect(accountMenu.dropdown).toBeVisible();
          });
        });

        // simulates bubbling to window
        function clickDropdownLink() {
          runs(function() {
            accountMenu.dropdownLink.click();
            $(window).click();
          });
          waits();
        }
      });
    });
  });

  describe("when the logout link is clicked", function() {
    var user;

    beforeEach(function() {
      clearServerTables();
      user = login();
      expect(user.guest()).toBeFalsy();
    });

    it("it assigns the current to the default guest", function() {
      accountMenu.dropdownLink.click();
      expect(accountMenu.logoutLink).toBeVisible();
      
      waitsFor("user to be logged out", function(complete) {
        accountMenu.logoutLink.trigger('click', complete);
        expect(User.find(user.id())).toBeDefined();
      });

      runs(function() {
        expect(User.find(user.id())).toBeUndefined();
        expect(Application.currentUser().guest()).toBeTruthy();
      });
    });
  });
});
