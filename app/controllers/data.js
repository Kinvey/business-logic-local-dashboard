import Ember from "ember";

var DataController = Ember.ArrayController.extend({
  importType: 'byFilename',
  exportURL: 'http://localhost:2845/configuration/collectionData/export',
  selectedCollectionExportURL: function() {
    return this.get('exportURL') + '?collectionName=' + this.get('selectedCollection');
  }.property('selectedCollection'),
  reservedCollections: ['_outgoingPushMessages', '_outgoingEmailMessages', '_blLogs'],
  userAccessibleCollections: Ember.computed.filter('model', function(collection) {
    return (this.get('reservedCollections').indexOf(collection.name) === -1);
  }),
  noCollectionSelected: Ember.computed.empty('selectedCollection'),
  noFilesSelected: Ember.computed.empty('files'),
  importTypeIsFilename: Ember.computed.equal('importType', 'byFilename'),
  supportedCommands: ['count', 'find', 'findOne', 'insert', 'remove', 'update'],
  selectedFindCommand: Ember.computed.equal('selectedCommand', 'find'),
  selectedFindOneCommand: Ember.computed.equal('selectedCommand', 'findOne'),
  selectedCountCommand: Ember.computed.equal('selectedCommand', 'count'),
  selectedRemoveCommand: Ember.computed.equal('selectedCommand', 'remove'),
  selectedInsertCommand: Ember.computed.equal('selectedCommand', 'insert'),
  selectedUpdateCommand: Ember.computed.equal('selectedCommand', 'update'),
  showQueryInput: Ember.computed.or('selectedCountCommand', 'selectedFindCommand', 'selectedFindOneCommand', 'selectedRemoveCommand', 'selectedUpdateCommand'),
  showJSONInput: Ember.computed.or('selectedInsertCommand', 'selectedUpdateCommand'),
  limitOptionInput: 20,
  limitOption: true,
  sortOptionDisabled: Ember.computed.not('sortOption'),
  skipOptionDisabled: Ember.computed.not('skipOption'),
  limitOptionDisabled: Ember.computed.not('limitOption'),
  fieldsOptionDisabled: Ember.computed.not('fieldsOption'),
  commandOptions: {
    find: ['sort', 'limit', 'skip', 'fields'],
    findOne: ['sort', 'skip', 'fields'],
    update: ['upsert', 'updateMultiple']
  },
  selectedCommandOptions: function() {
    return this.commandOptions[this.get('selectedCommand')] || [];
  }.property('selectedCommand'),
  showError: function(errorText) {
    Ember.$('#error-box-text').html(errorText);
    Ember.$('#error-box').fadeIn(400);
  },
  showSuccess: function(successText) {
    Ember.$('#alert-box-text').html(successText);
    Ember.$('#alert-box').fadeIn(400);
    Ember.run.later(this, function() {
      Ember.$('#alert-box').fadeOut(300);
    }, 5000);
  },
  resetSelection: function() {
    this.set('selectedCollection', null);
    this.set('selectedCommand', null);
    this.set('executedCommand', false);
    this.set('commandResults', null);
    this.set('jsonError', null);
  },
  actions: {
    selectCollection: function(collectionName) {
      Ember.$('#' + collectionName).parents('.btn-group').find('.dropdown-toggle').html(collectionName + ' <span class="caret"></span>');
      this.set('selectedCollection', collectionName);
      this.set('executedCommand', false);
      this.set('commandResults', null);
      this.set('jsonError', null);
    },
    selectCommand: function(command) {
      Ember.$('#command-' + command).parents('.btn-group').find('.dropdown-toggle').html(command + ' <span class="caret"></span>');
      this.set('selectedCommand', command);
      this.set('executedCommand', false);
      this.set('commandResults', null);
      this.set('jsonError', null);
    },
    showOptions: function() {
      this.set('showCommandOptions', !this.get('showCommandOptions'));
    },
    submitCommand: function() {
      this.set('executedCommand', false);
      this.set('commandResults', null);
      this.set('jsonError', null);

      var requestBody = { options: {} };

      if (this.get('showQueryInput') && this.get('searchQueryText') && this.get('searchQueryText').length > 0) {
        var jsonQuery;
        try {
          jsonQuery = JSON.parse(this.get('searchQueryText'));
        }
        catch (e) {
          this.set('jsonError', 'Error parsing query: ' + e);
          return
        }

        requestBody.query = jsonQuery;
      }

      if (this.get('showJSONInput') && this.get('entityText') && this.get('entityText').length > 0) {
        var entity;
        try {
          entity = JSON.parse(this.get('entityText'));
        }
        catch (e) {
          this.set('jsonError', 'Error parsing JSON: ' + e);
          return
        }

        requestBody.entity = entity;
      }

      var option, optionEnabled, optionInputValue;
      var optionsArray = this.get('selectedCommandOptions');
      for (var i=0; i < optionsArray.length; i++) {
        option = optionsArray[i];
        optionEnabled = this.get(option + 'Option');
        if (optionEnabled) {
          optionInputValue = this.get(option + 'OptionInput');
          if (optionInputValue) {
            try {
              optionInputValue = JSON.parse(optionInputValue);
            }
            catch (e) {}
            requestBody.options[option] = optionInputValue;
          }
          else {
            requestBody.options[option] = true;
          }
        }
      }

      var _this = this;
      Ember.$.ajax('http://localhost:2845/collectionAccess/' + this.get('selectedCollection') + '/' + this.get('selectedCommand'),
        { type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(requestBody),
          complete: function(data) {
            _this.set('executedCommand', true);
            _this.set('commandResults', JSON.stringify(data.responseJSON, null, 2));
          }
        });
    },
    copyCommand: function() {
      this.set('executedCommand', false);
      this.set('commandResults', null);
      this.set('jsonError', null);

      var commandText = 'modules.collectionAccess.collection("' + this.get('selectedCollection') + '").' + this.get('selectedCommand') + '(';

      if (this.get('showQueryInput')) {
        if (this.get('searchQueryText') && this.get('searchQueryText').length > 0) {
          var jsonQuery;
          try {
            jsonQuery = JSON.parse(this.get('searchQueryText'));
          }
          catch (e) {
            this.set('jsonError', 'Error parsing query: ' + e);
            return
          }

          commandText += this.get('searchQueryText');
        }
        else {
          return
        }
      }

      if (this.get('showJSONInput')) {
        if (this.get('entityText') && this.get('entityText').length > 0) {
          var entity;
          try {
            entity = JSON.parse(this.get('entityText'));
          }
          catch (e) {
            this.set('jsonError', 'Error parsing JSON: ' + e);
            return
          }

          if (this.get('showQueryInput')) {
            commandText += ', ';
          }
          commandText += this.get('entityText');
        }
        else {
          return
        }
      }

      var option, optionEnabled, optionInputValue;
      var optionsArray = this.get('selectedCommandOptions');
      var options = {};
      for (var i=0; i < optionsArray.length; i++) {
        option = optionsArray[i];
        optionEnabled = this.get(option + 'Option');
        if (optionEnabled) {
          optionInputValue = this.get(option + 'OptionInput')
          if (optionInputValue) {
            try {
              optionInputValue = JSON.parse(optionInputValue);
            }
            catch (e) {}
            options[option] = optionInputValue;
          }
          else {
            options[option] = true;
          }
        }
      }

      commandText += ', ' + JSON.stringify(options);
      commandText += ', function(err, result) {\n  if (err) {\n    // handle error here\n  }\n  else {\n    // handle success here\n  }\n  response.complete();\n});'

      this.set('commandCode', commandText);
    },
    showCreateCollectionModal: function() {
      this.set('newCollectionName', null);
    },
    createCollection: function() {
      var _this = this;
      if (this.get('newCollectionName') && this.get('newCollectionName').length > 0) {
        return Ember.$.ajax('http://localhost:2845/collectionAccess/' + _this.get('newCollectionName') + '/collectionExists', { type: 'POST' , statusCode: { 200: function(data) {
          if (data.exists) {
            return _this.showError('A collection with that name already exists');
          }

          return Ember.$.ajax('http://localhost:2845/collectionAccess/' + _this.get('newCollectionName') + '/createCollection', { type: 'POST' , statusCode: { 201: function(data) {
            Ember.$('#createCollectionModal').modal('hide');
            _this.send('refreshModel');
            _this.showSuccess('Successfully created collection ' + _this.get('newCollectionName'));
          }}});
        }}});
      }
      else {
        this.showError('Please enter a name for your new collection');
      }
    },
    import: function() {
      var files = this.get('files');
      if (!files || files.length === 0) {
        return;
      }

      var formData = new FormData();
      for (var i = 0; i < files.length; i++) {
        formData.append(files[i].fileName, files[i]);
      }

      var importURL = 'http://localhost:2845/configuration/collectionData/import';

      if (this.get('importType') === 'manual' && this.get('importIntoCollectionName').length > 0) {
        importURL += '?collectionName=' + encodeURIComponent(this.get('importIntoCollectionName'));
      }

      var _this = this;
      return Ember.$.ajax({
        url: importURL,
        type: 'POST',
        contentType: false,
        processData: false,
        data: formData,
        global: false
      }).then(function(data) {
        Ember.$('#importDataModal').modal('hide');
        _this.send('refreshModel');
        var importInfo = 'Successfully imported data!<br><br>';
        for (var collectionName in data) {
          importInfo += data[collectionName].numberImported + ' entities into ' + collectionName + '<br>';
        }
        _this.showSuccess(importInfo);
      }, function(xhr) {
        Ember.$('#importDataModal').modal('hide');
        _this.showError('Error encountered importing data:<br>' + xhr.responseText);
      });
    }
  }
});

export default DataController;