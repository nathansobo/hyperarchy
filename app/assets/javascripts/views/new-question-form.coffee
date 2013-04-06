{User} = Models

class Views.NewQuestionForm extends Views.ModalForm
  @headingText: "Ask an open-ended question:"
  @buttonText: "Ask Question"

  @belowTextArea: ->
    @div class: 'clear-float', =>
      @div "Who can view this question?"
      @select outlet: 'visibility', =>
        User.getCurrent().groups().each (group) =>
          @option "Anyone at #{group.name()}", value: "group #{group.id()}"
          @option "Anyone at #{group.name()} with the link", value: "private #{group.id()}"
        @option "Anyone with the link", value: "private" if APP_MODE is 'public'

  getValues: ->
    [visibility, groupId] = @visibility.val().split(' ')
    groupId = parseInt(groupId) if groupId
    { body: @textarea.val(), visibility, groupId }
