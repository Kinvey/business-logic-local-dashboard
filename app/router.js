import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('dashboard', { path: '/' });
  this.resource('dashboard', { path: '/dashboard' });
  this.resource('data', { path: '/data' });
  this.resource('email', { path: '/email' });
  this.resource('push', { path: '/push' });
  this.resource('logs', { path: '/logs' });
});

export default Router;
