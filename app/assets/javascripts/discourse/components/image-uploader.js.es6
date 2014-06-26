export default Em.Component.extend({
  uploading: false,
  uploadProgress: 0,

  backgroundStyle: function() {
    var imageUrl = this.get('imageUrl');
    if (Em.isNone(imageUrl)) { return; }

    return "background-image: url(" + imageUrl + ")";
  }.property('imageUrl'),

  _initializeUploader: function() {
    var $upload = this.$('input[type=file]'),   // note: we can't cache this as fileupload replaces the input after upload
       self = this;

    $upload.fileupload({
      url: this.get('uploadUrl'),
      dataType: "json",
      fileInput: $upload,
      formData: { image_type: this.get('type') }
    });

    $upload.on('fileuploadsubmit', function (e, data) {
      var result = Discourse.Utilities.validateUploadedFiles(data.files, true);
      self.setProperties({ uploadProgress: 0, uploading: result });
      return result;
    });
    $upload.on("fileuploadprogressall", function(e, data) {
      var progress = parseInt(data.loaded / data.total * 100, 10);
      self.set("uploadProgress", progress);
    });
    $upload.on("fileuploaddone", function(e, data) {
      if(data.result.url) {
        self.set('imageUrl', data.result.url);
      } else {
        bootbox.alert(I18n.t('post.errors.upload'));
      }
    });
    $upload.on("fileuploadfail", function(e, data) {
      Discourse.Utilities.displayErrorForUpload(data);
    });
    $upload.on("fileuploadalways", function() {
      self.setProperties({ uploading: false, uploadProgress: 0});
    });
  }.on('didInsertElement'),

  _destroyUploader: function() {
    this.$('input[type=file]').fileupload('destroy');
  }.on('willDestroyElement'),

  actions: {
    selectFile: function() {
      this.$('input[type=file]').click();
    },

    trash: function() {
      this.set('imageUrl', null);
      this.sendAction('clear');
    }
  }
});