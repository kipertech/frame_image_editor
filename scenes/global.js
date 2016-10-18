module.exports = {
  BAR_COLOR: '#1789ce',
  STATUS_COLOR: '#0477bd',
  TOKEN: null,
  OVERLAYID: null,
  MAINCOMPONENT: null,
  ONEDITOR: false,

  mainCallback()
  {
    if (this.TOKEN != null)
      this.MAINCOMPONENT.checkFacebook(true);
    else this.MAINCOMPONENT.checkFacebook(false);
  }
};