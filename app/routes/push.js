import Ember from "ember";

var PushRoute = Ember.Route.extend({
  model: function(){
    var _this = this;
    return Ember.$.get('http://localhost:2845/push').then(function(data){
      if (data && data.length > 0) {
        var message;
        for (var i=data.length-1; i >=0; i--) {
          message = data[i];
          if (!_this.lastNotificationTime || _this.lastNotificationTime < message.timestamp) {
            Ember.$('#push-phone').append('<span class="push-phone-notification" id="push-' + message._id + '">' + message.content + '</span>');
            (function(id) {
              Ember.run.later(_this, function() { Ember.$('#push-' + id).remove(); }, 2000);
            })(message._id);
          }
        }

        _this.lastNotificationTime = data[data.length - 1].timestamp;
      }
      else {
        _this.lastNotificationTime = null;
      }

      return data;
    });
  },
  activate: function() {
    this.refrshTimer = Ember.run.later(this, this.refreshModel, 3000);
  },
  deactivate: function() {
    Ember.run.cancel(this.refreshTimer);
  },
  refreshModel: function() {
    this.refresh();
    this.refrshTimer = Ember.run.later(this, this.refreshModel, 3000);
  },
  actions: {
    'refreshNotificationList': function() {
      Ember.run.cancel(this.refreshTimer);

      this.refreshModel();
    },
    'clearNotificationList': function() {
      var _this = this;
      return new Ember.RSVP.Promise(function(resolve) {
        Ember.$.ajax('http://localhost:2845/push', { type: 'DELETE', statusCode: { 200: function(data){ resolve(data); } } });
      }).then(function(data){
        if (data.removed > 0) {
          Ember.$('#alert-box').html('Successfully deleted ' + data.removed + ' notifications');
          Ember.$('#alert-box').fadeIn(400);
          Ember.run.later(this, function() {
            Ember.$('#alert-box').fadeOut(300);
          }, 2000);
          _this.refresh();
        }
      });
    }
  }
});

export default PushRoute;