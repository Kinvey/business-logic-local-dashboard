import Ember from "ember";

var LogsController = Ember.ArrayController.extend({
  sortKey: ['timestampInMS:desc'],
  sortedLogs: Ember.computed.sort('model', 'sortKey')
});

export default LogsController;