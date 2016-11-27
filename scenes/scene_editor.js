import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    Image,
    CameraRoll,
    TouchableHighlight,
    AsyncStorage,
    Alert,
    Dimensions,
    StatusBar,
    Platform,
    ScrollView
} from 'react-native';

import { takeSnapshot } from 'react-native-view-shot';
import RNFetchBlob from 'react-native-fetch-blob';
import {Actions} from 'react-native-router-flux';
import PhotoView from 'react-native-photo-view';
import { View } from 'react-native-animatable';
import Slider from 'react-native-slider';
import RNFS from 'react-native-fs';

import PopupSelection from '../components/modal';
import LoadingModal from '../components/loadingModal';
import { alertLogin, checkInternet } from '../components/features_FB';

GLOBAL = require('../components/global');

export default class EditorScene extends Component {
    constructor(props) {
        super(props);
        this.state = {
            previewSource: { uri: 'http://www.valleyspuds.com/wp-content/uploads/Russet-Potatoes-cut.jpg' },
            value: {
                width: 512,
                height: 512,
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
        GLOBAL.EDITORCOMPONENT = this;
    }

    backButtonPressed()
    {
        if (this.state.isUploading == false)
        {
            Actions.pop();
            GLOBAL.EDITORCOMPONENT = null;
        }
        else Alert.alert("HCMUS Avatar", "Ảnh hiện đang trong quá trình tải lên, vui lòng chờ quá trình này hoàn tất")
    }

    componentDidMount() {
        StatusBar.setHidden(false);
    }

    componentWillMount() {
        GLOBAL.EDITORCOMPONENT = null;
    }

    openModal3(id) {
        this.refs.modal3.open();
    }

    //Share new picture
    cmdSharePict()
    {
        if (GLOBAL.TOKEN != null)
        {
            if (this.state.isUploading == false)
            {
                Alert.alert(
                    'HCMUS Avatar',
                    'Ảnh này sẽ được tải lên trang Facebook của bạn và được đặt trong album mang tên "HCMUS Avatar". \n\nBạn có muốn tiếp tục?',
                    [
                        { text: 'Hủy', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                        {
                            text: 'OK', onPress: () => {
                            checkInternet(data => {
                                if (data)
                                {
                                    fetch(GLOBAL.FATHERLINK + '/users/updatenum', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            id: GLOBAL.OVERLAYID
                                        })
                                    });

                                    GLOBAL.MAINCOMPONENT.state.fetchData.forEach((item) => {
                                        if (item._id == GLOBAL.OVERLAYID)
                                        {
                                            ++item.num_user;
                                            GLOBAL.MAINCOMPONENT.forceUpdate();
                                        }
                                    });

                                    takeSnapshot(this.refs["newPict"], this.state.value)
                                        .then(res => this.setState({
                                            error: null,
                                            res,
                                            previewSource: {
                                                uri:
                                                    this.state.value.result === "base64"
                                                        ? "data:image/" + this.state.value.format + ";base64," + res
                                                        : res
                                            }
                                        }, () => {
                                            this.setState({ isUploading: true, uploadImage: require('../images/btnFB_disabled.png'), uploadText: 'Đang tải\nlên...' });
                                            RNFetchBlob.fetch('POST', `https://graph.facebook.com/me/photos?access_token=${GLOBAL.TOKEN}`, {
                                                'Content-Type': 'multipart/form-data',
                                            }, [{ name: 'avatar', filename: 'avatar.png', type: 'image/', data: RNFetchBlob.wrap(this.state.previewSource.uri) },
                                                // elements without property filename will be sent as plain text
                                            ]).then((resp) => {
                                                Alert.alert("HCMUS Avatar", "Ảnh đã được tải lên album của bạn thành công!");
                                                this.setState({ isUploading: false, uploadImage: require('../images/btnFB.png'), uploadText: 'Tải lên\nFacebook' });
                                            }).catch((err) => {
                                                Alert.alert("HCMUS Avatar", "Có lỗi xảy ra, vui lòng thử lại sau.");
                                                this.setState({ isUploading: false, uploadImage: require('../images/btnFB.png'), uploadText: 'Tải lên\nFacebook' });
                                            })
                                        }))
                                }
                                else
                                {
                                    Alert.alert("HCMUS Avatar", "Không có kết nối Internet, tải ảnh lên Facebook không khả dụng")
                                }
                            })

                        }
                        }
                    ]
                )
            }
            else
            {
                Alert.alert("HCMUS Avatar", "Ảnh hiện đang trong quá trình tải lên, vui lòng chờ quá trình này hoàn tất trước khi tiếp tục tải lên ảnh mới")
            }
        }
        else
        {
            alertLogin(true)
        }
    }

    //Snapshot view
    snapshot(refName, showAlert, callback) {
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
                        //Push use time count to server
                        checkInternet(data => {
                            if (data)
                            {
                                fetch(GLOBAL.FATHERLINK + '/users/updatenum', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        id: GLOBAL.OVERLAYID
                                    })
                                })
                            }
                        })

                        GLOBAL.MAINCOMPONENT.state.fetchData.forEach((item) => {
                            if (item._id == GLOBAL.OVERLAYID)
                            {
                                ++item.num_user;
                                GLOBAL.MAINCOMPONENT.forceUpdate();
                            }
                        });

                        if (showAlert == true)
                        {
                            Alert.alert(
                                'HCMUS Avatar',
                                'Lưu vào thư viện ảnh thành công!',
                                [{ text: 'OK', onPress: () => Actions.pop()} ]
                            );
                        }
                        this.setState({ imgPath: result });
                        //Callback
                        callback(true);
                    })
                    .catch((e) => {
                            Alert.alert(
                                'HCMUS Avatar',
                                'Có lỗi xảy trong quá trình lưu ảnh vào thiết bị, xin vui lòng thử lại sau\n\n(Error Code: CameraRoll)',
                                [{ text: 'OK' }]
                            );
                            callback(false);
                        }
                    );
            }))
            .catch(error => {
                Alert.alert(
                    'HCMUS Avatar',
                    'Có lỗi xảy trong quá trình lưu ảnh vào thiết bị, xin vui lòng thử lại sau\n\n(Error Code: ViewShot)',
                    [{ text: 'OK' }]
                );
                this.setState({ error, res: null, previewSource: null });
                callback(false);
            });
    }

    //Save to device
    cmdSaveToDevice() {
        this.snapshot("newPict", true, (data) => {
            if (data)
                console.log('Save success')
            else console.log('Save failed');
        });
    }

    //Rotate right
    cmdRotateRight() {
        if (this.state.rotateAngle == 315)
            this.setState({ rotateAngle: 0 });
        else this.setState({ rotateAngle: this.state.rotateAngle + 90 });
    }

    //Revert all changes
    cmdReset()
    {
        if (GLOBAL.CURRENTEDITOR == 1)
        {
            GLOBAL.CURRENTEDITOR = 2;
            Actions.newEditor2({ data: this.props.data });
        }
        else
        {
            GLOBAL.CURRENTEDITOR = 1;
            Actions.newEditor1({ data: this.props.data });
        }
    }

    openProgress() {
        this.refs.progressDialog.open();
    }

    closeProgress() {
        this.refs.progressDialog.close();
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
                    source={{ uri: `file://${RNFS.DocumentDirectoryPath}/hcmusavatar_${overlayID}.png` }}
                    style={{top: 0, left: 0, position: 'absolute', opacity: this.state.overlayOpacity, width: this.state.overlaySize, height: this.state.overlaySize}}
                    imageSize='contain'/>

            </View>
        )
    }

    //Cover view to prevent user from editting when done
    renderProtectedView()
    {
        if (!this.state.show)
            return(null)
        else
            return(
                <View style={{ width: this.state.imageSize, height: this.state.imageSize,
                            position: 'absolute', top: 50, left: 0, backgroundColor: 'transparent' }} />
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

    //Render the button and slider area
    renderToolEditor() {
        let st = Dimensions.get('window').width;
        if (this.state.show == false)
        {
            return (
                <View style={{ padding: 15, width: st, flex: 1, justifyContent: 'center', backgroundColor: 'white' }}>

                    <View
                        animation='fadeIn' duration={350}
                        style={{ flexDirection:'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>

                        <Text>Độ trong suốt       </Text>
                        <Slider
                            value={10}
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

                    style={{ padding: 15, width: st, flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>

                    <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
                        <Image
                            source={require('../images/txtCapNhatAnh.png')}
                            style={{width: st / 2 + 100, height: (st / 2 + 100) * 0.1, marginTop: 10}}
                            resizeMode='stretch'
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 1 }} >

                            {/* Uplaod to Facebook button */}
                            <TouchableHighlight style={{flex: 1}} onPress={() => this.cmdSharePict()} underlayColor='#F2F2F2'>
                                <View
                                    animation={'fadeIn'} duration={350}
                                    style={{alignItems:'center', justifyContent: 'center', padding: 10}}>

                                    <Image
                                        source={this.state.uploadImage}
                                        style={{width: st / 5, height: st / 5}}
                                        resizeMode='stretch'
                                    />

                                    <Text style={{marginTop: 5, textAlign: 'center'}}>{this.state.uploadText}</Text>
                                </View>
                            </TouchableHighlight>

                            { this.renderBigButton(require('../images/btnSaveToDevice.png'), st / 5, st / 5, 'Lưu vào thư viện', () => this.cmdSaveToDevice(), 'fadeIn', 0) }
                        </View>
                    </View>


                </View>
            )
    }

    renderEditButton()
    {
        let barHeight = StatusBar.currentHeight;
        if (this.state.show)
        {
            return(
                <TouchableHighlight
                    onPress={() => this.toggleShow() }
                    style={{position: 'absolute', top: barHeight, right: 0, width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
                    underlayColor={GLOBAL.STATUS_COLOR}>
                    <Image
                        source={require('../images/bar_edit.png')}
                        style={{width: 25, height: 25}}
                        resizeMode='stretch'/>

                </TouchableHighlight>
            )
        }
        else
        {
            return(null)
        }
    }

    //Main render function
    render() {
        let barHeight = (Platform.OS == 'ios') ? 20 : 0;
        return (
            <View style={[styles.container]}>

                {/* Action Bar */}
                <View style={{backgroundColor: GLOBAL.BAR_COLOR, marginTop: barHeight, height: 50, width: Dimensions.get('window').width, padding: 5, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                    <Image
                        source={require('../images/title.png')}
                        style={{width: 140, height: 15}}
                        resizeMode='stretch'/>

                </View>

                {/* Back button */}
                <TouchableHighlight
                    onPress={() => this.backButtonPressed()}
                    style={{position: 'absolute', top: barHeight, left: 0, width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
                    underlayColor={GLOBAL.STATUS_COLOR}>
                    <Image
                        source={require('../images/bar_back.png')}
                        style={{width: 35, height: 35}}/>
                </TouchableHighlight>

                { this.renderEditButton() }

                <ScrollView
                    style={{ flex: 1, backgroundColor: 'white' }}
                    contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>

                    { this.renderProfilePict() }
                    { this.renderToolEditor() }
                </ScrollView>

                <PopupSelection ref='modal3' onEditor={true}/>

                <LoadingModal ref='progressDialog' loadingText='Đang tải ảnh đại diện Facebook...'/>

                { this.renderProtectedView() }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GLOBAL.STATUS_COLOR,
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
