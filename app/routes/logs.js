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

const LogsRoute = Ember.Route.extend({
  model() {
    return Ember.$.ajax('http://localhost:2845/collectionAccess/_blLogs/find', {
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ query: {} })
    });
  },
  actions: {
    refreshLogList() {
      this.refresh();

      // restart the timer
      Ember.run.cancel(this.refreshTimer);
      this.refrshTimer = Ember.run.later(this, this.refreshModel, 5000);
    },
    clearLogList() {
      const _this = this;
      return Ember.$.ajax('http://localhost:2845/collectionAccess/_blLogs/remove', {
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ query: {} })
      }).done(function (data) {
        if (data.count > 0) {
          Ember.$('#alert-box').html(`Successfully deleted ${data.count} logs`);
          Ember.$('#alert-box').fadeIn(400);
          Ember.run.later(this, () => {
            Ember.$('#alert-box').fadeOut(300);
          }, 2000);
          _this.refresh();
        }
      });
    }
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
  }
});

export default LogsRoute;
