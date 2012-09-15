{ User, Question, Answer, Ranking } = Models
{ Server } = Monarch.Remote

describe "Views.QuestionView", ->
  [currentUser, question, answer1, answer2, answer3, questionView] = []

  beforeEach ->
    currentUser = User.created(id: 1, fullName: "Current User")
    User.currentUserId = currentUser.id()
    question = Question.created(id: 1, body: "What's your favorite color?")
    answer1 = question.answers().created(id: 1, body: "Red", position: 1)
    answer2 = question.answers().created(id: 2, body: "Green", position: 2)
    answer3 = question.answers().created(id: 3, body: "Blue", position: 3)

    questionView = new Views.QuestionView(question)

    spyOn(Ranking, 'createOrUpdate')

  it "populates itself with current rankings when rendered", ->
    currentUser.rankings().created(answerId: 1, questionId: 1, position: .5)
    currentUser.rankings().created(answerId: 2, questionId: 1, position: 2)

    questionView = new Views.QuestionView(question)
    items = questionView.personalRanking.find('.answer')
    expect(items.length).toBe 2
    expect(items.eq(0).text()).toBe answer2.body()
    expect(items.eq(0).data('position')).toBe 2
    expect(items.eq(1).text()).toBe answer1.body()
    expect(items.eq(1).data('position')).toBe .5

  describe "when items are dragged into / within the personal ranking list", ->
    it "creates / updates a ranking for the dragged answer", ->
      item1 = questionView.collectiveRanking.find('[data-answer-id=1]').clone()
      item2 = questionView.collectiveRanking.find('[data-answer-id=2]').clone()
      item3 = questionView.collectiveRanking.find('[data-answer-id=3]').clone()

      # drag/drop first item
      questionView.personalRanking.append(item1)
      questionView.updateAnswerRanking(item1)

      expect(Ranking.createOrUpdate).toHaveBeenCalledWith(
        answer: answer1,
        position: 1
      )
      Ranking.createOrUpdate.reset()

      # drag/drop next item
      questionView.personalRanking.prepend(item2)
      questionView.updateAnswerRanking(item2)
      expect(Ranking.createOrUpdate).toHaveBeenCalledWith(
        answer: answer2,
        position: 2
      )
      Ranking.createOrUpdate.reset()

      # simulate the rankings completing on the server, out of order
      Ranking.created(id: 2, userId: currentUser.id(), answerId: 2, position: 2)
      Ranking.created(id: 1, userId: currentUser.id(), answerId: 1, position: 1)
      expect(questionView.personalRanking.find('.answer').length).toBe 2

      # drag/drop next item between the first two
      item2.after(item3)
      questionView.updateAnswerRanking(item3)
      expect(Ranking.createOrUpdate).toHaveBeenCalledWith(
        answer: answer3,
        position: 1.5
      )
      Ranking.createOrUpdate.reset()

      # move item1 from bottom to the middle
      item2.after(item1.detach())
      questionView.updateAnswerRanking(item1)
      expect(Ranking.createOrUpdate).toHaveBeenCalledWith(
        answer: answer1,
        position: 1.75
      )
      Ranking.createOrUpdate.reset()

      # drag another clone of item1 from collective ranking: it should not duplicate
      item1b = questionView.collectiveRanking.find('[data-answer-id=1]').clone()
      questionView.personalRanking.append(item1b)
      questionView.updateAnswerRanking(item1b)
      expect(questionView.personalRanking.find('.answer').length).toBe 3
      expect(questionView.personalRanking.find('.answer:last').data('answer-id')).toBe 1
      expect(Ranking.createOrUpdate).toHaveBeenCalledWith(
        answer: answer1,
        position: .75
      )
