import React, { Component } from 'react';
import { 
    StyleSheet, 
    Text, 
    Image, 
    CameraRoll, 
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
import { createAnimatableComponent, View } from 'react-native-animatable';
import Slider from 'react-native-slider'

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
            overlayOpacity: 1,
            rotateAngle: 0,
            imgPath: null,
            show: false,
            overlaySize: Dimensions.get('window').width,

            //Upload to Facebook
            isUploading: false,
            uploadImage: require('../images/btnFB.png'),
            uploadText: 'Tải lên Facebook'
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
                                'Lưu vào thư viện ảnh thành công!',
                                [{ text: 'OK', onPress: () => Actions.pop()} ]
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

    //Save to device
    cmdSaveToDevice() {
        this.snapshot("newPict", true);
    }

    //Rotate right
    cmdRotateRight() {
        if (this.state.rotateAngle == 315)
            this.setState({ rotateAngle: 0 });
        else this.setState({ rotateAngle: this.state.rotateAngle + 90 });
    }

    getSavePath(oID)
    {
        switch (oID) 
        {
            case 1:
                p = require('../images/overlay_1.png');
                break;
            case 2:
                p = require('../images/overlay_2.png');
                break;
            case 3:
                p = require('../images/overlay_3.png');
                break;
            case 4:
                p = require('../images/overlay_4.png');
                break;
        }
        return(p);
    }

    cmdReset()
    {
        Actions.newEditor({ data:this.props.data });
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
                    minimumZoomScale={1}
                    maximumZoomScale={3}
                    scale={1}
                    onLoad={() => console.log("Image loaded!")}
                    style={{ width: this.state.imageSize, height: this.state.imageSize, transform: [{ rotate: this.state.rotateAngle + ' deg' }] }} />

                <Image 
                    source={this.getSavePath(overlayID)} 
                    style={{top: 0, left: 0, position: 'absolute', opacity: this.state.overlayOpacity, width: this.state.overlaySize, height: this.state.overlaySize}}
                    imageSize='contain'/>

            </View>
        )
    }

    //Quick function render the buttons
    renderBigButton(imagePath, imageWidth, imageHeight, text, eventHandler, animated, animationDelay)
    {   
        return(
            <TouchableHighlight style={{flex: 1}} onPress={eventHandler} underlayColor='#F2F2F2'>
                <View
                    animation={animated} duration={350} delay={animationDelay}
                    style={{alignItems:'center', justifyContent: 'center', padding: 10}}>

                    <Image
                        source={imagePath}
                        style={{width: imageWidth, height: imageHeight}}
                        resizeMode='stretch'
                    />

                    <Text style={{marginTop: 5, textAlign: 'center'}}>{text}</Text>
                </View>
            </TouchableHighlight>
        )
    }

    renderSmallButton(imagePath, imageWidth, imageHeight, eventHandler, animated, animationDelay)
    {   
        return(
            <TouchableHighlight 
                style={{width: imageWidth + 5, height: imageHeight + 5}} 
                onPress={eventHandler} underlayColor='#F2F2F2'>

                <View
                    animation={animated} duration={350} delay={animationDelay}
                    style={{alignItems:'center', justifyContent: 'center', padding: 10}}>

                    <Image
                        source={imagePath}
                        style={{width: imageWidth, height: imageHeight}}
                        resizeMode='stretch'
                    />

                    <Text style={{marginTop: 5, textAlign: 'center'}}>{text}</Text>
                </View>
            </TouchableHighlight>
        )
    }

    //Render the button and slider area
    renderToolEditor() {
        let st = Dimensions.get('window').width;
        if (this.state.show == false) 
        {
            return (
                <View style={{ padding: 15, width: st, flex: 1, justifyContent: 'center' }}>

                    <View
                        animation='fadeIn' duration={350} 
                        style={{ flexDirection:'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>

                        <Text>Độ trong suốt       </Text>
                        <Slider
                            value={7}
                            minimumValue={1}
                            maximumValue={10}
                            trackStyle={style = {
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#dedfde',
                            }}
                            thumbStyle={style = {
                                width: 25,
                                height: 25,
                                borderRadius: 12,
                                backgroundColor: 'white',
                                borderColor: '#c3c3c3',
                                borderWidth: 1
                            }}
                            minimumTrackTintColor='#63d3ff'
                            style={{flex: 1, marginLeft: 5}}
                            onValueChange = {(overlayOpacity) => this.setState({ overlayOpacity: overlayOpacity / 10 }) }
                            />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 2, marginTop: 10, marginRight: 60, marginLeft: 60 }} >
                        { this.renderBigButton(require('../images/btnRotate.png'), 25, 22, 'Xoay hình', () => this.cmdRotateRight(), 'fadeInUp', 200) }
                        { this.renderBigButton(require('../images/btnAlbum.png'), 25, 22, 'Ảnh khác', () => this.openModal3(), 'fadeInUp', 200) }
                    </View>

                    <TouchableHighlight 
                        style={{width: 45, height: 42, position: 'absolute', bottom: 15, left: 10}} 
                        onPress={() => this.cmdReset()} underlayColor='#F2F2F2'>
                        
                        <View
                            animation={'fadeInUp'} duration={350} delay={500}
                            style={{alignItems:'center', justifyContent: 'center', flexDirection: 'row', padding: 10}}>

                            <Image
                                source={require('../images/btnReset.png')}
                                style={{width: 25, height: 22}}
                                resizeMode='stretch'
                            />

                            <View style={{ height: 25, width: 1, backgroundColor: 'gray', opacity: 0.2, marginLeft: 10 }} />
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight 
                        style={{width: 45, height: 42, position: 'absolute', bottom: 15, right: 10}} 
                        onPress={() => this.toggleShow()} underlayColor='#F2F2F2'>

                        <View
                            animation={'fadeInUp'} duration={350} delay={500}
                            style={{alignItems:'center', justifyContent: 'center', flexDirection: 'row', padding: 10}}>

                            <View style={{ height: 25, width: 1, backgroundColor: 'gray', opacity: 0.2, marginRight: 10 }} />

                            <Image
                                source={require('../images/btnDone.png')}
                                style={{width: 25, height: 20}}
                                resizeMode='stretch'
                            />

                        </View>
                    </TouchableHighlight>
                </View>
            )
        } 
        else 
            return (
                <View
                    
                    style={{ padding: 15, width: st, flex: 1, alignItems: 'center', justifyContent: 'center' }}>

                    <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
                        <Image
                            source={require('../images/txtCapNhatAnh.png')}
                            style={{width: st / 2 + 100, height: (st / 2 + 100) * 0.1, marginTop: 10}}
                            resizeMode='stretch'
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 1 }} >
                            { this.renderBigButton(require('../images/btnSaveToDevice.png'), st / 5, st / 5, 'Lưu vào\nthư viện', () => this.cmdSaveToDevice(), 'fadeIn') }
                            { this.renderBigButton(require('../images/btnEdit.png'), st / 5, st / 5, 'Quay lại\nchỉnh sửa', () => this.toggleShow(), 'fadeIn') }
                        </View>
                    </View>

                    
                </View>
            )
    }

    //Main render function
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
                        style={{width: 140, height: 15}}
                        resizeMode='stretch'/>

                </View>
                
                <TouchableHighlight
                    onPress={() => {
                        if (this.state.isUploading == false)
                            Actions.pop();
                        else
                            Alert.alert("HCMUS Avatar", "Ảnh hiện đang trong quá trình tải lên, vui lòng chờ quá trình này hoàn tất")
                    }}
                    style={{position: 'absolute', top: 0, left: 0, width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
                    underlayColor={GLOBAL.STATUS_COLOR}>
                    <Image
                        source={require('../images/bar_back.png')}
                        style={{width: 35, height: 35}}/>
                </TouchableHighlight>

                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
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
