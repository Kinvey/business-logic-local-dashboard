import Ember from "ember";

var DashboardRoute = Ember.Route.extend({
  model: function(){
    return Ember.RSVP.hash({
      collectionStats: Ember.$.get('http://localhost:2845/collectionAccess/collectionStats'),
      emailMessages: Ember.$.get('http://localhost:2845/email'),
      pushNotifications: Ember.$.get('http://localhost:2845/push'),
      logs: Ember.$.ajax('http://localhost:2845/collectionAccess/_blLogs/find', {
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ query: {} })
      }),
      containerStatus: Ember.$.get('http://localhost:2845/status').then(function(){ return true }, function(){ return false })
    });
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

export default DashboardRoute;