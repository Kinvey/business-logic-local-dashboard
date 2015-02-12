import Ember from "ember";

var EmailRoute = Ember.Route.extend({
  model: function(){
    return Ember.$.get('http://localhost:2845/email');
  },
  actions: {
    'refreshMessageList': function() {
      this.refresh();

      // restart the timer
      Ember.run.cancel(this.refreshTimer);
      this.refrshTimer = Ember.run.later(this, this.refreshModel, 5000);
    },
    'clearMessageList': function() {
      var _this = this;
      return new Ember.RSVP.Promise(function(resolve) {
        Ember.$.ajax('http://localhost:2845/email', { type: 'DELETE', statusCode: { 200: function(data){ resolve(data); } } });
      }).then(function(data){
        if (data.removed > 0) {
          Ember.$('#alert-box').html('Successfully deleted ' + data.removed + ' messages');
          Ember.$('#alert-box').fadeIn(400);
          Ember.run.later(this, function() {
            Ember.$('#alert-box').fadeOut(300);
          }, 2000);
          _this.refresh();
        }
      });
    }
  },
  activate: function() {
    this.refrshTimer = Ember.run.later(this, this.refreshModel, 5000);
  },
  deactivate: function() {
    Ember.run.cancel(this.refreshTimer);
  },
  refreshModel: function() {
    this.refresh();
    this.refrshTimer = Ember.run.later(this, this.refreshModel, 5000);
  }
});

export default EmailRoute;