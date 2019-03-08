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

import Ember from 'ember';

const DashboardRoute = Ember.Route.extend({
  model() {
    return Ember.RSVP.hash({
      collectionStats: Ember.$.get('http://localhost:2845/collectionAccess/collectionStats'),
      emailMessages: Ember.$.get('http://localhost:2845/email'),
      pushNotifications: Ember.$.get('http://localhost:2845/push'),
      logs: Ember.$.ajax('http://localhost:2845/collectionAccess/_blLogs/find', {
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ query: {} })
      }),
      containerStatus: new Ember.RSVP.Promise(((resolve) => {
        Ember.$.get('http://localhost:2845/status').then(() => {
          resolve(true);
        }, () => {
          resolve(false);
        });
      }))
    });
  },
  activate() {
    this.refrshTimer = Ember.run.later(this, this.refreshModel, 5000);
  },
  deactivate() {
    Ember.run.cancel(this.refreshTimer);
  },
  refreshModel() {
    this.refresh();
    this.refrshTimer = Ember.run.later(this, this.refreshModel, 5000);
  },
  actions: {
    error() {
      return false;
    }
  }
});

export default DashboardRoute;
