module.exports = {
  BAR_COLOR: '#1789ce',
  STATUS_COLOR: '#0477bd',
  TOKEN: null,
  OVERLAYID: null,
  MAINCOMPONENT: null,
  EDITORCOMPONENT: null,
  ONEDITOR: false,
  CURRENTEDITOR: 1,

  FATHERLINK: 'http://128.199.226.4:8000',

  mainCallback()
  {
    if (this.TOKEN != null)
      this.MAINCOMPONENT.checkFacebook(true);
    else this.MAINCOMPONENT.checkFacebook(false);
  }
};