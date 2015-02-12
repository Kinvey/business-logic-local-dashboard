import Ember from "ember";

var RadioButtonComponent = Ember.Component.extend({  
    tagName: 'input',

    attributeBindings: ['type', 'checked'],

    type: 'radio',

    checked: function () {
        return this.get('value') === this.get('name');
    }.property('value', 'name'),

    click: function () {
        this.set('name', this.get('value'));
    }
});

export default RadioButtonComponent;