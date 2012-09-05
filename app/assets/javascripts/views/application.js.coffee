class Views.Application extends View
  @content: ->
    @div class: 'navbar navbar-fixed-top navbar-inverse', =>
      @div class: 'navbar-inner', =>
        @div class: 'container', =>
          @a "Hyperarchy", class: 'brand', href: '/'
          @ul class: 'nav pull-right', =>
            @li =>
              @button "New Question", class: 'btn btn-primary'

