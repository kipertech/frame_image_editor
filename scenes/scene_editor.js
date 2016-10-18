import React, { Component } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    Image, 
    CameraRoll, 
    Slider, 
    TouchableHighlight, 
    TouchableOpacity,
    AsyncStorage, 
    Alert, 
    Dimensions, 
    StatusBar  } from 'react-native';
import { LoginButton, AccessToken, LoginManager, GraphRequestManager, GraphRequest } from 'react-native-fbsdk';
import { takeSnapshot } from 'react-native-view-shot';
import Button from 'react-native-button';
import RNFetchBlob from 'react-native-fetch-blob';
import {Actions} from 'react-native-router-flux';
import PopupSelection from './modal'
import {alertLogin, loginFb, getPictURL, getFBImagePath} from './login';
GLOBAL = require('./global');
import TabScene from './scene_tabs'
import PhotoView from 'react-native-photo-view'

export default class EditorScene extends Component {
    constructor(props) {
        super(props);
        this.state = {
            previewSource: { uri: 'http://www.valleyspuds.com/wp-content/uploads/Russet-Potatoes-cut.jpg' },
            value: {
                format: "png",
                quality: 1,
                result: "file",
                filename: "HCMUSAvatar_Snapshot"
            },
            res: null,
            error: null,
            pictUrl: null,
            idUrl: null,
            showProfile: false,
            imageSize: Dimensions.get('window').width,
            overlayOpacity: 0.7,
            rotateAngle: 0,
            imgPath: null,
            show: false,

            isUploading: false
        };
    }

    toggleShow() {
        this.setState({
            show: !this.state.show
        });
    }
    
    componentWillMount() 
    {
        const self = this
        const value = AsyncStorage.getItem('fbtoken', (error, result) => {
            if (result != null) 
                self.setState({ loginDisabled: true })
            else self.setState({ loginDisabled: false }); 
        });
    }
    
    openModal3(id) {
        this.refs.modal3.open();
    }
    //Snapshot view
    snapshot(refName, showAlert) {
        takeSnapshot(this.refs[refName], this.state.value)
            .then(res => this.setState({
                error: null,
                res,
                previewSource: {
                    uri:
                    this.state.value.result === "base64"
                        ? "data:image/" + this.state.value.format + ";base64," + res
                        : res
                },
            }, () => {
                CameraRoll.saveToCameraRoll(this.state.previewSource.uri, 'photo')
                    .then((result) => {
                        if (showAlert == true)
                        {
                            Alert.alert(
                                'HCMUS Avatar',
                                'Lưu vào thư viện ảnh của thiết bị thành công!',
                                [{ text: 'OK' }]
                            );
                        }
                        this.setState({ imgPath: result })
                     })
                    .catch((e) =>
                        Alert.alert(
                            'HCMUS Avatar',
                            'Có lỗi xảy trong quá trình lưu ảnh vào thiết bị, xin vui lòng thử lại sau',
                            [{ text: 'OK' }]
                        ) 
                    );
            }))
            .catch(error => {
                Alert.alert(
                            'HCMUS Avatar',
                            'Có lỗi xảy trong quá trình lưu ảnh vào thiết bị, xin vui lòng thử lại sau',
                            [{ text: 'OK' }]
                        );  
                this.setState({ error, res: null, previewSource: null }) 
            });
    }

    //Share new picture
    cmdSharePict() {
        {this.snapshot("newPict", false)}
        if (GLOBAL.TOKEN != null) 
        {
            if (this.state.isUploading == false)
            {
                Alert.alert(
                    'HCMUS Avatar',
                    'Ảnh này sẽ được tải lên trang Facebook của bạn và nằm trong album mang tên "HCMUS Avatar". \n\n Bạn có muốn tiếp tục?',
                    [
                        { text: 'Hủy', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                        {
                            text: 'OK', onPress: () => {
                                this.setState({isUploading: true});
                                RNFetchBlob.fetch('POST', `https://graph.facebook.com/me/photos?access_token=${GLOBAL.TOKEN}`, {
                                    'Content-Type': 'multipart/form-data',
                                }, [{ name: 'avatar', filename: 'avatar.png', type: 'image/', data: RNFetchBlob.wrap(this.state.imgPath) },
                                    // elements without property `filename` will be sent as plain text 
                                    ]).then((resp) => {
                                        Alert.alert("HCMUS Avatar", "Ảnh đã được tải lên album của bạn thành công!");
                                        this.setState({isUploading: false});
                                    }).catch((err) => {
                                        Alert.alert("HCMUS Avatar", "Có lỗi xảy ra, vui lòng thử lại sau.");
                                        this.setState({isUploading: false});
                                    })
                            }
                        }
                    ]
                )
            }
            else
            {
                Alert.alert("HCMUS Avatar", "Ảnh hiện đang trong quá trình tải lên, bạn vui lòng đợi quá trình này hoàn tất trước khi tiếp tục tải lên ảnh mới")
            }
        }
        else
        {
            alertLogin(true)
        }

    }

    //Save to device
    cmdSaveToDevice() {
        this.snapshot("newPict", true);
    }

    //Rotate right
    cmdRotateRight() {
        if (this.state.rotateAngle == 315)
            this.setState({ rotateAngle: 0 });
        else this.setState({ rotateAngle: this.state.rotateAngle + 45 });
    }

    //Rotate left
    cmdRotateLeft() {
        if (this.state.rotateAngle == -315)
            this.setState({ rotateAngle: 0 });
        else this.setState({ rotateAngle: this.state.rotateAngle - 45 });
    }

    getSavePath(oID)
    {
        var p = null;
        switch (oID) 
        {
            case 1:
                p = require('../images/overlay_60year.png');
                break;
            case 2:
                p = require('../images/overlay_lgbt.png');
                break;
            case 3:
                p = require('../images/overlay_christmas.png');
                break;
            case 4:
                p = require('../images/overlay_newyear.png');
                break;
            case 5:
                p = require('../images/overlay_model.png');
                break;
            case 6:
                p = require('../images/overlay_women.png');
                break;
        }
        return(p);
    }

    //Render profile picture
    renderProfilePict() {
        let pic = { uri: this.props.data };
        let overlayID = GLOBAL.OVERLAYID;
        return (
            <View
                ref='newPict'
                style={{width: this.state.imageSize, height: this.state.imageSize, justifyContent: 'center', alignItems: 'center' }}
                collapsable={false}>

                <PhotoView
                    source={pic}
                    minimumZoomScale={0.5}
                    maximumZoomScale={3}
                    scale={1}
                    onLoad={() => console.log("Image loaded!")}
                    style={{ width: this.state.imageSize, height: this.state.imageSize, transform: [{ rotate: this.state.rotateAngle + ' deg' }] }} />

                <Image 
                    source={this.getSavePath(overlayID)} 
                    style={{top: 0, left: 0, position: 'absolute', opacity: this.state.overlayOpacity, width: this.state.imageSize, height: this.state.imageSize}}
                    imageSize='contain'/>

            </View>
        )
    }

    renderToolEditor() {
        if (!this.state.show) 
        {
            let st = Dimensions.get('window').width;
            return (
                <View ref="toolView" style={{ padding: 10, paddingLeft: 20, paddingRight: 5, width: st }}>

                    <View ref="viewOverlayOpacity" style={{ flexDirection:'row', alignItems: 'center' }}>
                        <Text>Độ trong suốt</Text>
                        <Slider
                            value= {7}
                            minimumValue={1}
                            maximumValue={10}
                            style={{ flex: 1 }}
                            onValueChange = {(overlayOpacity) => this.setState({ overlayOpacity: overlayOpacity / 10 }) }
                            />
                    </View>

                    <View flexDirection="row" style={{ marginTop: 5, marginBottom: 10, width: 260, justifyContent: 'center', alignItems: 'center' }} >
                        <Button
                            containerStyle={[styles.button]}
                            style={[styles.buttonText]}
                            onPress={this.openModal3.bind(this) }>
                            Chọn lại ảnh
                        </Button>

                        <Button
                            containerStyle={[styles.button]}
                            style={[styles.buttonText]}
                            onPress={() => {
                                if (!this.state.show) {
                                    return (
                                        this.toggleShow()
                                    )
                                }
                                else return null
                            } }>
                            Hoàn tất
                        </Button>
                    </View>
                </View>
            )
        } else return (

            <View >
                <Button
                    containerStyle={[styles.button]}
                    style={[styles.buttonText]}
                    onPress={() => this.cmdSharePict() }>
                    Đăng lên Facebook
                </Button>

                <Button
                    containerStyle={[styles.button]}
                    style={[styles.buttonText]}
                    onPress={() => this.cmdSaveToDevice() }>
                    Lưu vào thư viện ảnh
                </Button>

                <Button
                    containerStyle={[styles.button]}
                    style={[styles.buttonText]}
                    onPress={() => {
                        if (this.state.show) {
                            return (
                                this.toggleShow()
                            )
                        }
                        else return null
                    } }>
                    Quay lại
                </Button>
            </View>
        )
    }

    //Start rendering
    render() {    
        return (
            <View style={[styles.container]}>
                <StatusBar
                    backgroundColor = {GLOBAL.STATUS_COLOR}
                    barStyle="light-content"
                />

                <View style={{backgroundColor: GLOBAL.BAR_COLOR, height: 50, width: Dimensions.get('window').width, padding: 5, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                    <Image
                        source={require('../images/title.png')}
                        style={{width: 160, height: 35}}
                        resizeMode='stretch'/>

                </View>
                
                <TouchableHighlight
                    onPress={() => Actions.pop()}
                    style={{position: 'absolute', top: 0, left: 0, width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
                    underlayColor={GLOBAL.STATUS_COLOR}>
                    <Image
                        source={require('../images/bar_back.png')}
                        style={{width: 35, height: 35}}/>
                </TouchableHighlight>

                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    { this.renderProfilePict() }
                    { this.renderToolEditor() }
                </View>

                <PopupSelection ref='modal3' onEditor={true}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    button: {
        overflow: 'hidden',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
        marginRight: 5,
        marginTop: 5,
        flex: 1
    },

    buttonRotate: {
        overflow: 'hidden',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
        marginRight: 5,
        width: 40,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },

    buttonText: {
        fontSize: 15,
        fontWeight: 'normal',
        color: '#333333'
    },

    buttonRotateText: {
        fontSize: 10,
        fontWeight: 'normal',
    }
});

const movable = {
  backgroundColor: 'green',
  width: 100,
  height: 100,
  position: 'absolute'
}
