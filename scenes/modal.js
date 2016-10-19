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
        else Actions.newEditor({ data: path });
    }

    //Take picture with camera
    pickSingleWithCamera() {
        ImagePicker.openCamera({
            cropping: false,
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
            cropping: false,
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
        let st = Dimensions.get('window').width;
        return (
            <Modal {...this.props}
                style={{ height: (st - 100) * 0.25 + 140, width: st - 100 }}
                position={'center'} ref={'mainModal'} backButtonClose={true}
                backdropOpacity={0.7}
                animationDuration={200}
                >

                {/* Title */}
                <Image
                    source={require('../images/rect_chonanh.png')}
                    style={{ width: st - 100, height: (st - 100) * 0.25,  }}
                    resizeMode='stretch'
                />

                {/* From Facebook */}
                <TouchableNativeFeedback onPress={() => { this.refs.mainModal.close(); this.checkOnEditor(); alertLogin(false); } } >
                    <View flexDirection='row' style={[styles.selectionItem]}>
                        <Image
                            source={require('../images/selection_facebook.png')}
                            style={[styles.selectionImage]}
                            resizeMode='center'
                        />
                        <Text style={{ fontSize: 15 }}>Ảnh đại diện Facebook</Text>
                    </View>
                </TouchableNativeFeedback>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: 'gray', opacity: 0.2 }} />

                {/* From Gallery */}
                <TouchableNativeFeedback onPress={() => { this.refs.mainModal.close(); this.pickSingle(); } }>
                    <View flexDirection='row' style={[styles.selectionItem]}>
                        <Image
                            source={require('../images/selection_gallery.png')}
                            style={[styles.selectionImage]}
                            resizeMode='center'
                        />
                        <Text style={{ fontSize: 15 }}>Thư viện</Text>
                    </View>
                </TouchableNativeFeedback>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: 'gray', opacity: 0.2 }} />

                {/* From Camera */}
                <TouchableNativeFeedback onPress={() => { this.refs.mainModal.close(); this.pickSingleWithCamera(); } }>
                    <View flexDirection='row' style={[styles.selectionItem]}>
                        <Image
                            source={require('../images/selection_camera.png')}
                            style={[styles.selectionImage]}
                            resizeMode='center'
                         />
                        <Text style={{ fontSize: 15 }}>Chụp hình</Text>
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
        marginTop: 5,
        marginBottom: 5,
        paddingLeft: 5,
        paddingRight: 5
    },

    selectionImage: {
        marginRight: 10,
        height: 36,
        width: 36
    }

});

