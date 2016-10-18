import React, { Component } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Image, 
  TouchableOpacity, 
  TouchableNativeFeedback, 
  NativeModules, 
  Dimensions, 
  AppRegistry, 
  Alert
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker'
import Modal from 'react-native-modalbox';
import { Actions } from 'react-native-router-flux'
import { LoginButton, AccessToken, LoginManager } from 'react-native-fbsdk';
import { alertLogin, loginFb, getPictURL, getFBImagePath, getImageUri } from './login'
GLOBAL = require('./global');

export default class PopUpSelection extends Component {
  constructor(props) {
    super(props);
  }

  open() {
    this.refs.mainModal.open();
  }

  //Open editor scene with selected image
  openEditor(path) {
    if (this.props.onEditor == false)
      Actions.editor({ data: path })
    else Actions.newEditor({ data:path });
  }

  //Take picture with camera
  pickSingleWithCamera() {
    ImagePicker.openCamera({
      cropping: true,
      width: 500,
      height: 500
    })
      .then(image => {
        this.setState({
          image: { uri: image.path, width: image.width, height: image.height },
          images: null
        }, () => this.openEditor(image.path));
      })
      .catch(e => console.log(e));

  }

  componentWilldMount() {
    GLOBAL.ONEDITOR = this.props.onEditor;
  }

  //Choose picture from gallery
  pickSingle() {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
      compressVideo: true
    })
      .then(image => {
        this.setState({
          image: { uri: image.path, width: image.width, height: image.height, mime: image.mime },
          images: null
        }, () => this.openEditor(image.path));;
      })
      .catch(e => { console.log(e); });
  }

  openMainModal(id) {
    this.refs.mainModal.open();
  }
  
  checkOnEditor() {
    GLOBAL.ONEDITOR = this.props.onEditor;
  }

  render() {
    return (
      <Modal {...this.props}
        style={{ justifyContent: 'center', height: 185, width: 300, padding: 15 }}
        position={'center'} ref={'mainModal'} backButtonClose={true}
        backdropOpacity={0.7}
        animationDuration={200}
        >

        {/* Title */}
        <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 5 }}>Chọn ảnh</Text>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: 'gray', opacity: 0.2 }} />

        {/* From Facebook */}
        <TouchableNativeFeedback onPress={() => { this.refs.mainModal.close(); this.checkOnEditor(); alertLogin(false);  }} >
          <View flexDirection='row' style={[styles.selectionItem, { marginTop: 10 }]}>
            <Image
              source={require('../images/selection_facebook.png')}
              style={[styles.selectionImage]} />
            <Text style={{ fontSize: 17 }}>Ảnh đại diện Facebook</Text>
          </View>
        </TouchableNativeFeedback>

        {/* From Gallery */}
        <TouchableNativeFeedback onPress={() => { this.refs.mainModal.close(); this.pickSingle(); }}>
          <View flexDirection='row' style={[styles.selectionItem]}>
            <Image
              source={require('../images/selection_gallery.png')}
              style={[styles.selectionImage]} />
            <Text style={{ fontSize: 17 }}>Thư viện</Text>
          </View>
        </TouchableNativeFeedback>

        {/* From Camera */}
        <TouchableNativeFeedback onPress={() => { this.refs.mainModal.close(); this.pickSingleWithCamera();  }}>
          <View flexDirection='row' style={[styles.selectionItem]}>
            <Image
              source={require('../images/selection_camera.png')}
              style={[styles.selectionImage]} />
            <Text style={{ fontSize: 17 }}>Chụp hình</Text>
          </View>
        </TouchableNativeFeedback>
      </Modal>
    );
  }
}

var styles = StyleSheet.create({

  wrapper: {
    paddingTop: 50,
    flex: 1
  },

  btn: {
    margin: 10,
    backgroundColor: "#3B5998",
    color: "white",
    padding: 10
  },

  btnModal: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    backgroundColor: "transparent"
  },

  text: {
    color: "black",
    fontSize: 22
  },

  selectionItem: {
    alignItems: 'center',
    marginTop: 5
  },

  selectionImage: {
    marginRight: 10,
    height: 36,
    width: 36
  }

});

