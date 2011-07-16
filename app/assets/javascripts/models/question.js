_.constructor("Question", Model.Record, {
  constructorProperties: {
    initialize: function() {
      this.columns({
        organizationId: 'key',
        creatorId: 'key',
        body: 'string',
        details: 'string',
        voteCount: 'integer',
        score: 'float',
        updatedAt: 'datetime',
        createdAt: 'datetime'
      });

      this.defaultOrderBy('score desc');

      this.hasMany('answers');
      this.hasMany('votes', {orderBy: 'updatedAt desc'});
      this.hasMany('comments', {constructorName: 'QuestionComment'});
      this.relatesToMany('commenters', function() {
        return this.comments().join(User).on(QuestionComment.creatorId.eq(User.id));
      });

      this.hasMany('questionVisits');
      this.relatesToMany('voters', function() {
        return this.votes().joinThrough(User);
      });

      this.hasMany('rankings', {orderBy: 'position desc'});

      this.belongsTo('organization');
      this.belongsTo('creator', {constructorName: 'User'});
    },

    scoreUpdateInterval: 60000,

    updateScoresPeriodically: function() {
      setInterval(this.hitch('updateScores'), this.scoreUpdateInterval);
    },

    updateScores: function() {
      var queue = new Monarch.Queue(10);
      this.each(function(question) {
        queue.add(question.hitch('updateScore'));
      });
      queue.start();
    }
  },

  afterInitialize: function() {
    this.rankingsByUserId = {};
    this.rankedAnswersByUserId = {};
    this.unrankedAnswersByUserId = {};
  },

  rankingsForUser: function(user) {
    var userId = user.id();
    if (this.rankingsByUserId[userId]) return this.rankingsByUserId[userId];
    return this.rankingsByUserId[userId] = this.rankings().where({userId: userId}).orderBy(Ranking.position.desc());
  },

  rankingsForCurrentUser: function() {
    return this.rankingsForUser(Application.currentUser());
  },

  positiveRankingsForCurrentUser: function() {
    return this.rankingsForCurrentUser().where(Ranking.position.gt(0));
  },

  rankedAnswersForUser: function(user) {
    var userId = user.id();
    if (this.rankedAnswersByUserId[userId]) return this.rankedAnswersByUserId[userId];
    return this.rankedAnswersByUserId[userId] = this.rankingsForUser(user).joinThrough(Answer);
  },

  editableByCurrentUser: function() {
    return Application.currentUser().admin() || this.belongsToCurrentUser() || this.organization().currentUserIsOwner();
  },

  belongsToCurrentUser: function() {
    return this.creator() === Application.currentUser();
  },

  unrankedAnswersForUser: function(user) {
    var userId = user.id();
    if (this.unrankedAnswersByUserId[userId]) return this.unrankedAnswersByUserId[userId];
    return this.unrankedAnswersByUserId[userId] = this.answers().difference(this.rankedAnswersForUser(user));
  },

  currentUsersVisit: function() {
    return this.questionVisits().find({userId: Application.currentUserId});
  },

  fetchVotes: function() {
    return Server.fetch(this.votes(), this.voters());
  },

  fetchCommentsAndCommentersIfNeeded: function() {
    if (this.commentFetchFuture) {
      return this.commentFetchFuture;
    } else {
      return this.commentFetchFuture =
        this.answers()
          .joinThrough(AnswerComment)
          .join(User).on(AnswerComment.creatorId.eq(User.id))
          .fetch();
    }
  },

  formattedCreatedAt: function() {
    return $.PHPDate("M j, Y @ g:ia", this.createdAt());
  },

  updateScore: function() {
    this.remotelyUpdated({score: this.computeScore()});
  },

  computeScore: function() {
    return (this.voteCount() + Question.SCORE_EXTRA_HOURS) / Math.pow(this.ageInHours() + Question.SCORE_EXTRA_HOURS, Question.SCORE_GRAVITY);
  },

  ageInHours: function() {
    return (new Date().getTime() - this.createdAt().getTime()) / 3600000
  },

  url: function() {
    return "/questions/" + this.id();
  },

  absoluteUrl: function() {
    return Application.origin() + this.url();
  },

  newAnswerUrl: function() {
    return this.url() + "/answers/new";
  },

  shareOnFacebook: function() {
    var answers = this.positiveRankingsForCurrentUser().limit(3).joinThrough(Answer);
    var numAnswers = answers.size();
    var currentUserName = Application.currentUser().fullName();

    var caption, description;
    switch (numAnswers) {
      case 0:
        caption = this.noRankingsShareCaption;
        break;
      case 1:
        caption = currentUserName + "'s top answer:";
        break;
      default:
        caption = currentUserName + "'s top answers:";
    }

    if (numAnswers > 0) {
      var numerals = ["⑴", "⑵", "⑶"];
      description = answers.inject("", function(description, answer, i) {
        return description + " " + numerals[i] + " " + answer.body();
      });
    }

    FB.ui({
      method: 'feed',
      name: this.body(),
      link: this.absoluteUrl(),
      caption: caption,
      description: description
    });
  },

  trackView: function() {
    mpq.push(["track", "View Question", {
      mp_note: this.body(),
      body: this.body(),
      id: this.id(),
      organization: this.organization().name(),
      organizationId: this.organizationId(),
      creator: this.creator().fullName(),
      creatorId: this.creatorId()
    }]);
  },

  trackCreate: function() {
    mpq.push(["track", "Create Question", {
      mp_note: this.body(),
      body: this.body(),
      id: this.id(),
      organization: this.organization().name(),
      organizationId: this.organizationId(),
      creator: this.creator().fullName(),
      creatorId: this.creatorId()
    }]);
  },

  trackUpdate: function() {
    mpq.push(["track", "Update Question", {
      mp_note: this.body(),
      body: this.body(),
      id: this.id(),
      organization: this.organization().name(),
      organizationId: this.organizationId(),
      creator: this.creator().fullName(),
      creatorId: this.creatorId()
    }]);
  },

  noRankingsShareCaption: "Click on this question to suggest and rank answers."
});