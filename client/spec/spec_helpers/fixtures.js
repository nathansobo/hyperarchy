Screw.Unit(function(c) {

  var fixtures = {
    users: {
      nathan: {

      }
    },

    organizations: {
      meta: {
        name: "Meta Hyperarchy"
      },
      restaurant: {
        name: "Restaurant"
      }
    },

    elections: {
      features: {
        organizationId: 'meta',
        body: "What features should we add to Hyperarchy?"
      },
      menu: {
        organizationId: 'restaurant',
        body: "What items should be on the menu?"
      }
    },

    candidates: {
      rice: {
        electionId: 'menu',
        body: "A Side of Brown Rice"
      },
      fish: {
        electionId: 'menu',
        body: "Grilled Fish"
      },
      salad: {
        electionId: 'menu',
        body: "Salad"
      }
    },

    rankings: {
      nathanFish1: {
        userId: "nathan",
        electionId: "menu",
        candidateId: "fish",
        position: 1
      },
      nathanRice2: {
        userId: "nathan",
        electionId: "menu",
        candidateId: "rice",
        position: 2
      }
    }
  };

  c.useLocalFixtures = function() {
    c.init(function() {
      Repository.loadFixtures(fixtures);
    });
  }

  c.useRemoteFixtures = function() {
    c.useFakeServer();
    c.init(function() {
      Repository.clear();
      Server.Repository.loadFixtures(fixtures);
    });
  };
})
