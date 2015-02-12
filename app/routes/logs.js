import Ember from "ember";

var LogsRoute = Ember.Route.extend({
  model: function(){
    return Ember.$.ajax('http://localhost:2845/collectionAccess/_blLogs/find', {
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ query: {} })
    });
  },
  actions: {
    'refreshLogList': function() {
      this.refresh();

      // restart the timer
      Ember.run.cancel(this.refreshTimer);
      this.refrshTimer = Ember.run.later(this, this.refreshModel, 5000);
    },
    'clearLogList': function() {
      var _this = this;
      return Ember.$.ajax('http://localhost:2845/collectionAccess/_blLogs/remove', {
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ query: {} })
      }).done(function(data){
        if (data.count > 0) {
          Ember.$('#alert-box').html('Successfully deleted ' + data.count + ' logs');
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

export default LogsRoute;