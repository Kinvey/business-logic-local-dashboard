import Ember from "ember";

var DataRoute = Ember.Route.extend({
  model: function(){
    return Ember.$.get('http://localhost:2845/collectionAccess/collectionStats')
  },
  actions: {
    refreshModel: function() {
      this.refresh();
    },
    didTransition: function(){
      this.controller.resetSelection();
    }
  }
});

export default DataRoute;