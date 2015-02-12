var FileUploadComponent = EmberUploader.FileField.extend({
  attributeBindings: ['multiple'],
  multiple: 'multiple'
});

export default FileUploadComponent;