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

const DataController = Ember.ArrayController.extend({
  importType: 'byFilename',
  exportURL: 'http://localhost:2845/configuration/collectionData/export',
  selectedCollectionExportURL: function () {
    return `${this.get('exportURL')}?collectionName=${this.get('selectedCollection')}`;
  }.property('selectedCollection'),
  reservedCollections: ['_outgoingPushMessages', '_outgoingEmailMessages', '_blLogs'],
  userAccessibleCollections: Ember.computed.filter('model', function (collection) {
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
  selectedCommandOptions: function () {
    return this.commandOptions[this.get('selectedCommand')] || [];
  }.property('selectedCommand'),
  showError(errorText) {
    Ember.$('#error-box-text').html(errorText);
    Ember.$('#error-box').fadeIn(400);
  },
  showSuccess(successText) {
    Ember.$('#alert-box-text').html(successText);
    Ember.$('#alert-box').fadeIn(400);
    Ember.run.later(this, () => {
      Ember.$('#alert-box').fadeOut(300);
    }, 5000);
  },
  resetSelection() {
    this.set('selectedCollection', null);
    this.set('selectedCommand', null);
    this.set('executedCommand', false);
    this.set('commandResults', null);
    this.set('jsonError', null);
  },
  actions: {
    selectCollection(collectionName) {
      Ember.$(`#${collectionName}`).parents('.btn-group').find('.dropdown-toggle').html(`${collectionName} <span class="caret"></span>`);
      this.set('selectedCollection', collectionName);
      this.set('executedCommand', false);
      this.set('commandResults', null);
      this.set('jsonError', null);
    },
    selectCommand(command) {
      Ember.$(`#command-${command}`).parents('.btn-group').find('.dropdown-toggle').html(`${command} <span class="caret"></span>`);
      this.set('selectedCommand', command);
      this.set('executedCommand', false);
      this.set('commandResults', null);
      this.set('jsonError', null);
    },
    showOptions() {
      this.set('showCommandOptions', !this.get('showCommandOptions'));
    },
    submitCommand() {
      this.set('executedCommand', false);
      this.set('commandResults', null);
      this.set('jsonError', null);

      const requestBody = { options: {} };

      if (this.get('showQueryInput') && this.get('searchQueryText') && this.get('searchQueryText').length > 0) {
        let jsonQuery;
        try {
          jsonQuery = JSON.parse(this.get('searchQueryText'));
        } catch (e) {
          this.set('jsonError', `Error parsing query: ${e}`);
          return;
        }

        requestBody.query = jsonQuery;
      }

      if (this.get('showJSONInput') && this.get('entityText') && this.get('entityText').length > 0) {
        let entity;
        try {
          entity = JSON.parse(this.get('entityText'));
        } catch (e) {
          this.set('jsonError', `Error parsing JSON: ${e}`);
          return;
        }

        requestBody.entity = entity;
      }

      let option; let optionEnabled; let
        optionInputValue;
      const optionsArray = this.get('selectedCommandOptions');
      for (let i = 0; i < optionsArray.length; i += 1) {
        option = optionsArray[i];
        optionEnabled = this.get(`${option}Option`);
        if (optionEnabled) {
          optionInputValue = this.get(`${option}OptionInput`);
          if (optionInputValue) {
            try {
              optionInputValue = JSON.parse(optionInputValue);
            } catch (e) { /* empty */ }
            requestBody.options[option] = optionInputValue;
          } else {
            requestBody.options[option] = true;
          }
        }
      }

      const _this = this;
      Ember.$.ajax(`http://localhost:2845/collectionAccess/${this.get('selectedCollection')}/${this.get('selectedCommand')}`,
        { type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(requestBody),
          complete(data) {
            _this.set('executedCommand', true);
            _this.set('commandResults', JSON.stringify(data.responseJSON, null, 2));
          }
        });
    },
    copyCommand() {
      this.set('executedCommand', false);
      this.set('commandResults', null);
      this.set('jsonError', null);

      let commandText = `modules.collectionAccess.collection("${this.get('selectedCollection')}").${this.get('selectedCommand')}(`;

      if (this.get('showQueryInput')) {
        if (this.get('searchQueryText') && this.get('searchQueryText').length > 0) {
          try {
            JSON.parse(this.get('searchQueryText'));
          } catch (e) {
            this.set('jsonError', `Error parsing query: ${e}`);
            return;
          }

          commandText += this.get('searchQueryText');
        } else {
          return;
        }
      }

      if (this.get('showJSONInput')) {
        if (this.get('entityText') && this.get('entityText').length > 0) {
          try {
            JSON.parse(this.get('entityText'));
          } catch (e) {
            this.set('jsonError', `Error parsing JSON: ${e}`);
            return;
          }

          if (this.get('showQueryInput')) {
            commandText += ', ';
          }
          commandText += this.get('entityText');
        } else {
          return;
        }
      }

      let option;
      let optionEnabled;
      let optionInputValue;
      const optionsArray = this.get('selectedCommandOptions');
      const options = {};
      for (let i = 0; i < optionsArray.length; i += 1) {
        option = optionsArray[i];
        optionEnabled = this.get(`${option}Option`);
        if (optionEnabled) {
          optionInputValue = this.get(`${option}OptionInput`);
          if (optionInputValue) {
            try {
              optionInputValue = JSON.parse(optionInputValue);
            } catch (e) { /* empty */ }
            options[option] = optionInputValue;
          } else {
            options[option] = true;
          }
        }
      }

      commandText += `, ${JSON.stringify(options)}`;
      commandText += ', function(err, result) {\n  if (err) {\n    // handle error here\n  }\n  else {\n    // handle success here\n  }\n  response.complete();\n});';

      this.set('commandCode', commandText);
    },
    showCreateCollectionModal() {
      this.set('newCollectionName', null);
    },
    createCollection() {
      const _this = this;
      if (this.get('newCollectionName') && this.get('newCollectionName').length > 0) {
        return Ember.$.ajax(`http://localhost:2845/collectionAccess/${_this.get('newCollectionName')}/collectionExists`, {
          type: 'POST',
          statusCode: {
            200(data) {
              if (data.exists) {
                return _this.showError('A collection with that name already exists');
              }
              return Ember.$.ajax(`http://localhost:2845/collectionAccess/${_this.get('newCollectionName')}/createCollection`, {
                type: 'POST',
                statusCode: { 201() {
                  Ember.$('#createCollectionModal').modal('hide');
                  _this.send('refreshModel');
                  _this.showSuccess(`Successfully created collection ${_this.get('newCollectionName')}`);
                }
                }
              });
            }
          }
        });
      }

      this.showError('Please enter a name for your new collection');
    },
    import() {
      const files = this.get('files');
      if (!files || files.length === 0) {
        return;
      }

      const formData = new FormData();
      for (let i = 0; i < files.length; i += 1) {
        formData.append(files[i].fileName, files[i]);
      }

      let importURL = 'http://localhost:2845/configuration/collectionData/import';

      if (this.get('importType') === 'manual' && this.get('importIntoCollectionName').length > 0) {
        importURL += `?collectionName=${encodeURIComponent(this.get('importIntoCollectionName'))}`;
      }

      const _this = this;
      return Ember.$.ajax({
        url: importURL,
        type: 'POST',
        contentType: false,
        processData: false,
        data: formData,
        global: false
      }).then((data) => {
        Ember.$('#importDataModal').modal('hide');
        _this.send('refreshModel');
        let importInfo = 'Successfully imported data!<br><br>';
        for (const collectionName in data) {
          importInfo += `${data[collectionName].numberImported} entities into ${collectionName}<br>`;
        }
        _this.showSuccess(importInfo);
      }, (xhr) => {
        Ember.$('#importDataModal').modal('hide');
        _this.showError(`Error encountered importing data:<br>${xhr.responseText}`);
      });
    }
  }
});

module.exports = DataController;
