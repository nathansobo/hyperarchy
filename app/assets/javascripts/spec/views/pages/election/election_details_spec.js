//= require spec/spec_helper

describe("Views.Pages.Election.ElectionDetails", function() {
  var election, election2, creator, electionDetails;

  beforeEach(function() {
    creator = User.createFromRemote({id: 1, firstName: "animal", lastName: "eater"});
    election = creator.elections().createFromRemote({id: 1, body: 'What would jesus & <mary> do?', details: "wlk on wtr.", organizationId: 98, createdAt: 91234});
    election2 = creator.elections().createFromRemote({id: 2, body: 'MEUAUOEU?!', details: "aonetuhaoeu??!?!!?", organizationId: 98, createdAt: 91234});

    attachLayout();

    electionDetails = Application.electionPage.electionDetails;
    $('#jasmine_content').html(electionDetails);
    electionDetails.election(election);
  });
});
