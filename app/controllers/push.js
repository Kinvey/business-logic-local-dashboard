import Ember from "ember";

var PushController = Ember.ArrayController.extend({
  sortKey: ['timestamp:desc'],
  sortedNotifications: Ember.computed.sort('model', 'sortKey')
});

export default PushController;