/**
 * Copyright 2018 Kinvey, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Ember = require('ember');

const DashboardController = Ember.ObjectController.extend({
  chartColorCache: [],
  reservedCollections: ['_outgoingPushMessages', '_outgoingEmailMessages', '_blLogs'],
  userAccessibleCollections: Ember.computed.filter('model.collectionStats', function (collection) {
    return (this.get('reservedCollections').indexOf(collection.name) === -1);
  }),
  nonEmptyUserAccessibleCollections: Ember.computed.filter('userAccessibleCollections', collection => collection.count > 0),
  allCollectionsAreEmpty: Ember.computed.empty('nonEmptyUserAccessibleCollections'),
  collectionChartData: Ember.computed.map('userAccessibleCollections', function (collection, index) {
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
    animationEasing: 'easeOutExpo',
    animationSteps: 30
  },
  lastPushNotificationTime: function () {
    return new Date(this.get('pushNotifications.lastObject.timestamp')).toString();
  }.property('pushNotifications.lastObject'),
  lastEmailMessageTime: function () {
    return new Date(this.get('emailMessages.lastObject.timestamp')).toString();
  }.property('emailMessages.lastObject'),
  lastLogTime: function () {
    return new Date(this.get('logs.lastObject.timestamp')).toString();
  }.property('logs.lastObject')
});

module.exports = DashboardController;
