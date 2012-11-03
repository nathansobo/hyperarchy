class Views.HomePage extends View
  @content: ->
    @div id: 'home', =>
      @subview 'questionsList', new Views.RelationView(
        buildItem: (question) -> $$ -> @li question.body()
      )

  show: ->
    super
    Models.Question.fetch().onSuccess =>
      @questionsList.setRelation(Models.Question.table)
