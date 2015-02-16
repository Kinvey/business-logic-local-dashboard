import Ember from "ember";

var DashboardController = Ember.ObjectController.extend({
  chartColorCache: [],
  reservedCollections: ['_outgoingPushMessages', '_outgoingEmailMessages', '_blLogs'],
  userAccessibleCollections: Ember.computed.filter('model.collectionStats', function(collection) {
    return (this.get('reservedCollections').indexOf(collection.name) === -1);
  }),
  nonEmptyUserAccessibleCollections: Ember.computed.filter('userAccessibleCollections', function(collection) {
    return collection.count > 0;
  }),
  allCollectionsAreEmpty: Ember.computed.empty('nonEmptyUserAccessibleCollections'),
  collectionChartData: Ember.computed.map('userAccessibleCollections', function(collection, index) {
    // chart colors should remain consistent once you've accessed the page for the first time
    if (!this.chartColorCache[index]) {
      this.chartColorCache[index] = randomColor();
    }

    return {
      label: collection.name,
      value: collection.count,
      color: this.chartColorCache[index]
    };
  }),
  collectionChartOptions: {
    animationEasing: "easeOutExpo",
    animationSteps: 30
  },
  lastPushNotificationTime: function() {
    return new Date(this.get('pushNotifications.lastObject.timestamp')).toString();
  }.property('pushNotifications.lastObject'),
  lastEmailMessageTime: function() {
    return new Date(this.get('emailMessages.lastObject.timestamp')).toString();
  }.property('emailMessages.lastObject'),
  lastLogTime: function() {
    return new Date(this.get('logs.lastObject.timestamp')).toString();
  }.property('logs.lastObject')
});

export default DashboardController;