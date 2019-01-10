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

const EmailRoute = Ember.Route.extend({
  model() {
    return Ember.$.get('http://localhost:2845/email');
  },
  actions: {
    refreshMessageList() {
      this.refresh();

      // restart the timer
      Ember.run.cancel(this.refreshTimer);
      this.refrshTimer = Ember.run.later(this, this.refreshModel, 5000);
    },
    clearMessageList() {
      const _this = this;
      return new Ember.RSVP.Promise(((resolve) => {
        Ember.$.ajax('http://localhost:2845/email', { type: 'DELETE', statusCode: { 200(data) { resolve(data); } } });
      })).then(function (data) {
        if (data.removed > 0) {
          Ember.$('#alert-box').html(`Successfully deleted ${data.removed} messages`);
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

export default EmailRoute;
