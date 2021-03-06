import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableHighlight,
    Dimensions,
    Alert
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker'
import Modal from 'react-native-modalbox';
import { Actions } from 'react-native-router-flux'
import { alertLogin, getProfileImageURL } from './features_FB'
GLOBAL = require('./global');

export default class PopUpSelection extends Component {
    constructor(props) {
        super(props);
    }

    open() {
        this.refs.mainModal.open();
    }

    //Open editor scene with selected image
    openEditor(path, w, h)
    {
        if (this.props.onEditor == false)
            Actions.editor({ data: path, imgWidth: w, imgHeight: h })
        else 
        {
            if (GLOBAL.CURRENTEDITOR == 1)
            {
                GLOBAL.CURRENTEDITOR = 2;
                Actions.newEditor2({ data: path, imgWidth: w, imgHeight: h });
            }
            else 
            {
                GLOBAL.CURRENTEDITOR = 1;
                Actions.newEditor1({ data: path, imgWidth: w, imgHeight: h });
            }
        }
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
                }, () => this.openEditor(image.path, image.width, image.height));
            })
            .catch(e => console.log(e));

    }

    componentWillMount() {
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
                }, () => this.openEditor(image.path, image.width, image.height));
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
                <TouchableHighlight 
                    onPress={() => { 
                    this.refs.mainModal.close();

                    { this.checkOnEditor(); }

                    if (GLOBAL.TOKEN == null)
                        alertLogin(false);
                    else 
                        getProfileImageURL((data) => {
                            if (data == false)
                                Alert.alert('HCMUS Avatar', 'Lỗi trong khi lấy ảnh đại diện từ Facebook, xin vui lòng thử lại sau');
                                
                            //Close progress dialog
                            GLOBAL.MAINCOMPONENT.closeProgress();
                            if (GLOBAL.EDITORCOMPONENT != null)
                                GLOBAL.EDITORCOMPONENT.closeProgress();
                        });
                    }} 
                    underlayColor='#F2F2F2'>

                    <View flexDirection='row' style={[styles.selectionItem]}>
                        <Image
                            source={require('../images/selection_FB.png')}
                            style={{marginRight: 15, marginLeft: 6, height: 21, width: 14}} 
                            resizeMode='stretch'
                        />
                        <Text style={[styles.selectionText]}>Ảnh đại diện Facebook</Text>
                    </View>

                </TouchableHighlight>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: 'gray', opacity: 0.2 }} />

                {/* From Gallery */}
                <TouchableHighlight 
                    onPress={() => { this.refs.mainModal.close(); this.pickSingle();}} 
                    underlayColor='#F2F2F2'>

                    <View flexDirection='row' style={[styles.selectionItem]}>
                        <Image
                            source={require('../images/selection_gallery.png')}
                            style={[styles.selectionImage]}
                            resizeMode='stretch'
                        />
                        <Text style={[styles.selectionText]}>Thư viện</Text>
                    </View>

                </TouchableHighlight>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: 'gray', opacity: 0.2 }} />

                {/* From Camera */}
                <TouchableHighlight 
                    onPress={() => { this.refs.mainModal.close(); this.pickSingleWithCamera(); }} 
                    underlayColor='#F2F2F2'>

                    <View flexDirection='row' style={[styles.selectionItem]}>
                        <Image
                            source={require('../images/selection_camera.png')}
                            style={[styles.selectionImage]}
                            resizeMode='stretch'
                         />
                        <Text style={[styles.selectionText]}>Chụp hình</Text>
                    </View>

                </TouchableHighlight>
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
        height: 46,
        padding: 5,
        paddingLeft: 10
    },

    selectionImage: {
        marginRight: 10,
        height: 21,
        width: 25
    },

    selectionText: {
        fontSize: 15,
    }

});

