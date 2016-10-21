module.exports = {
  BAR_COLOR: '#1789ce',
  STATUS_COLOR: '#0477bd',
  TOKEN: null,
  OVERLAYID: null,
  MAINCOMPONENT: null,
  EDITORCOMPONENT: null,
  ONEDITOR: false,
  CURRENTEDITOR: 1,

  FATHERLINK: 'https://hcmus-avatar-piksaldevone.c9users.io',

  mainCallback()
  {
    if (this.TOKEN != null)
      this.MAINCOMPONENT.checkFacebook(true);
    else this.MAINCOMPONENT.checkFacebook(false);
  }
};