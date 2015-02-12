import Ember from "ember";

var EmailController = Ember.ArrayController.extend({
  sortKey: ['timestamp:desc', 'message.to'],
  sortedMessages: Ember.computed.sort('model', 'sortKey')
});

export default EmailController;