_.constructor('Views.Pages.Election.RankingLi', Monarch.View.Template, {
  content: function(params) { with(this.builder) {
    li();
  }},

  viewProperties: {
    initialize: function() {
      if (this.ranking) {
        this.candidate = this.ranking.candidate();
        this.data('position', this.ranking.position());
        this.ranking.onUpdate(function() {
          this.data('position', this.ranking.position());
        }, this);
      }

      this.text(this.candidate.body());

    }
  }
});
