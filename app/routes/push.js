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

const runLater = (context, id) => {
  Ember.run.later(context, () => {
    Ember.$(`#push-${id}`).remove();
  }, 2000);
};

const PushRoute = Ember.Route.extend({
  model() {
    const _this = this;
    return Ember.$.get('http://localhost:2845/push').then((data) => {
      if (data && data.length > 0) {
        let message;
        for (let i = data.length - 1; i >= 0; i -= 1) {
          message = data[i];
          if (!_this.lastNotificationTime || _this.lastNotificationTime < message.timestamp) {
            Ember.$('#push-phone').append(`<span class="push-phone-notification" id="push-${message._id}">${message.content}</span>`);
            runLater(message._id);
          }
        }

        _this.lastNotificationTime = data[data.length - 1].timestamp;
      } else {
        _this.lastNotificationTime = null;
      }

      return data;
    });
  },
  activate() {
    this.refrshTimer = Ember.run.later(this, this.refreshModel, 3000);
  },
  deactivate() {
    Ember.run.cancel(this.refreshTimer);
  },
  refreshModel() {
    this.refresh();
    this.refrshTimer = Ember.run.later(this, this.refreshModel, 3000);
  },
  actions: {
    refreshNotificationList() {
      Ember.run.cancel(this.refreshTimer);

      this.refreshModel();
    },
    clearNotificationList() {
      const _this = this;
      return new Ember.RSVP.Promise(((resolve) => {
        Ember.$.ajax('http://localhost:2845/push', { type: 'DELETE', statusCode: { 200(data) { resolve(data); } } });
      })).then(function (data) {
        if (data.removed > 0) {
          Ember.$('#alert-box').html(`Successfully deleted ${data.removed} notifications`);
          Ember.$('#alert-box').fadeIn(400);
          Ember.run.later(this, () => {
            Ember.$('#alert-box').fadeOut(300);
          }, 2000);
          _this.refresh();
        }
      });
    }
  }
});

export default PushRoute;
