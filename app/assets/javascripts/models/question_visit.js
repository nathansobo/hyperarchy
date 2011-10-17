//  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
//  licensed under the Affero General Public License version 3 or later.  See
//  the COPYRIGHT file.

_.constructor("QuestionVisit", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      userId: 'key',
      questionId: 'key',
      updatedAt: 'datetime'
    });

    this.belongsTo('question');
    this.belongsTo('user');
  }
});
