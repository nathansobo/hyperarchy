describe "Views.NewQuestionForm", ->
  form = null

  beforeEach ->
    form = new Views.NewQuestionForm

  describe "when the submit button is clicked", ->
    it "creates a new question and dismisses the form", ->
      spyOn(form, 'modal')
      form.textarea.val("What's your favorite color?")
      form.find('button').click()
      expect(Monarch.Remote.Server.creates.length).toBe 1
      expect(form.modal).not.toHaveBeenCalled()

      Monarch.Remote.Server.lastCreate().succeed()

      expect(form.modal).toHaveBeenCalledWith('hide')

