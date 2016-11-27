import React, { Component } from 'react';
import ReactNative, {
    Text,
    AsyncStorage,
    TouchableOpacity,
    TouchableHighlight,
    StatusBar,
    Dimensions,
    Alert,
    Platform,
    ActivityIndicator
} from 'react-native';

import {
    loginFb,
    checkLoggedIn,
    checkInternet,
    getProfileImageURL2
} from '../components/features_FB';

import { LoginManager } from 'react-native-fbsdk';
import { createAnimatableComponent, View } from 'react-native-animatable';
import Drawer from 'react-native-drawer';
import PopUpSelection from '../components/modal';
import LoadingModal from '../components/loadingModal';
import {checkPermission, requestPermission} from 'react-native-android-permissions';
import RNFS from 'react-native-fs';
import moment from 'moment';

GLOBAL = require('../components/global');

const ScrollView = createAnimatableComponent(ReactNative.ScrollView);
const Image = createAnimatableComponent(ReactNative.Image);
const barHeight = StatusBar.currentHeight;

export default class ListScene extends Component
{
    constructor(props) {
        super(props);
        this.state = {
            drawerOpen: false,
            visible: false,

            //Drawer
            pictUrl: require('../images/logo_khtn_small.png'),
            pictBorder: 0,
            userName: 'HCMUS Avatar',
            userID: 'http://wwww.hcmus.edu.vn/',
            facebookIcon: require('../images/drawer_facebook.png'),
            facebookText: 'Đăng nhập Facebook',
            pictResize: 'center',

            //Grid View
            currentView: 'list',
            gridviewImage: require('../images/icon_view_grid.png'),
            gridImageMode: 'stretch',

            //Server
            fetchData: [],
            isConnected: false,
            imgOpactiy: 1,
            isFullyLoaded: false
        };

        this.imageData = {
            totalImage: 0,
            totalLoaded: 0
        }
    }

    componentWillMount() {
        checkLoggedIn((data) => {
            if (data != null)
                this.checkFacebook(true);
            else
                this.checkFacebook(false);
        });
        GLOBAL.MAINCOMPONENT = this;
    }

    componentDidMount() {
        if (Platform.OS == 'android')
        {
            //Get read storage permission
            checkPermission("android.permission.READ_EXTERNAL_STORAGE")
                .then((result) =>
                        console.log("Already granted Read Storage!", result)
                    , (result) => {
                        requestPermission("android.permission.READ_EXTERNAL_STORAGE")
                            .then((result) => {
                                console.log("Granted Read Storage!", result);
                            }, (result) => {
                                console.log("Not Granted Read Storage!");
                            });
                    });

            //Get write storage permission
            checkPermission("android.permission.WRITE_EXTERNAL_STORAGE")
                .then((result) =>
                        console.log("Already granted Write Storage!", result)
                    , (result) => {
                        requestPermission("android.permission.WRITE_EXTERNAL_STORAGE")
                            .then((result) => {
                                console.log("Granted Write Storage!", result);
                            }, (result) => {
                                console.log("Not Granted Write Storage!");
                            });
                    });
        }
        StatusBar.setHidden(false);
        this.fetchImageData();
    }

    //Fetch image JSON from server
    fetchImageData()
    {
        checkInternet(data => {
            if (data)
            {
                fetch(GLOBAL.FATHERLINK + '/users/getimages')
                    .then((response) => response.json())
                    .then((responseJson) => {
                        this.setState({ fetchData: responseJson.reverse(), isConnected: true });
                        this.imageData.totalImage = responseJson.length;
                        //
                        this.state.fetchData.forEach((item) => this.downloadImage(item));
                        AsyncStorage.setItem('hcmus_avatar_data', JSON.stringify(responseJson));
                    })
                    .done();
            }
            else
            {
                AsyncStorage.getItem('hcmus_avatar_data').then((tempData) => {
                    if (tempData !== undefined && tempData !== '' && tempData !== null)
                        this.setState({ fetchData: JSON.parse(tempData), isConnected: true, isFullyLoaded: true });
                    else
                        this.setState({ isConnected: false, fetchData: [] });
                });
            }
        })
    }

    //Download image data from server
    downloadImage(item)
    {
        RNFS.exists(`${RNFS.DocumentDirectoryPath}/hcmusavatar_${item._id}.png`)
            .then((res) => {
                if (res)
                {
                    ++this.imageData.totalLoaded;

                    //Start rendering when download is done
                    if (this.imageData.totalLoaded == this.imageData.totalImage)
                        this.setState({ isFullyLoaded: true });
                }
                else
                {
                    //Overlay
                    RNFS.downloadFile({
                        fromUrl: GLOBAL.FATHERLINK + `${item.url_avatar}`,
                        toFile: `${RNFS.DocumentDirectoryPath}/hcmusavatar_${item._id}.png`,
                    }).promise
                        .then((result) => {
                            if (result)
                                ++this.imageData.totalLoaded;

                            //Start rendering when download is done
                            if (this.imageData.totalLoaded == this.imageData.totalImage)
                                this.setState({ isFullyLoaded: true });
                        }).done();

                    //Image
                    RNFS.downloadFile({
                        fromUrl: GLOBAL.FATHERLINK + `${item.url_img}`,
                        toFile: `${RNFS.DocumentDirectoryPath}/hcmusavatar_img_${item._id}.png`,
                    }).promise
                        .then((result) => { console.log('Loaded ', item._id) }).done();
                }
            });
    }

    //Update Facebook info to drawer
    checkFacebook(isAvailable)
    {
        let st = Dimensions.get('window').width;
        if (isAvailable == true)
        {
            this.setState(
                {
                    pictUrl: require('../images/stormtrooper.jpg'),
                    pictBorder: (st / 5) / 2,
                    userName: 'Facebook User',
                    userID: 'ID: Unknown',
                    facebookIcon: require('../images/drawer_logout.png'),
                    facebookText: 'Đăng xuất',
                    pictResize: 'stretch'
                });
            getProfileImageURL2((data, data2, data3) => { this.setState({ pictUrl: { uri: data }, userName: data2, userID: 'ID: ' + data3 }) })
        }
        else
        {
            this.setState(
                {
                    pictUrl: require('../images/logo_khtn_small.png'),
                    pictBorder: 0,
                    userName: 'HCMUS Avatar',
                    userID: 'http://www.hcmus.edu.vn/',
                    facebookIcon: require('../images/drawer_facebook.png'),
                    facebookText: 'Đăng nhập Facebook',
                    pictResize: 'contain'
                })
        }
    }

    //Log in to Facebook
    handleLoginButton() {
        if (this.state.facebookText != 'Đăng xuất')
        {
            loginFb(true,
                (data) => {
                    if (data != false)
                    {
                        Alert.alert(
                            'HCMUS Avatar',
                            'Đăng nhập tài khoản Facebook thành công!',
                            [{ text: 'OK' }]
                        );
                    };
                });
        }
        else
        {
            { this.handleLogoutButton() }
        }
    }

    //Log out Facebook
    handleLogoutButton() {
        GLOBAL.TOKEN = null;
        LoginManager.logOut();
        Alert.alert(
            'HCMUS Avatar',
            'Đăng xuất tài khoản Facebook thành công',
            [{ text: 'OK' }]
        )
        { this.checkFacebook(false) };
    }

    //Selections for image picker
    openSelection(oID) {
        GLOBAL.OVERLAYID = oID;
        this.refs.mainModal.open();
    }

    cmdInformation() {
        Alert.alert(
            'HCMUS Avatar',
            'Developed and sponsored by Piksal Studio, 2016',
            [{ text: 'OK' }]
        )
    }

    //Main render function
    render() {
        let st = Dimensions.get('window').width;
        return (
            <Drawer
                ref={(ref) => this.drawer = ref}
                type="overlay"
                tapToClose={true}
                openDrawerOffset={0.2}
                panCloseMask={0.2}
                panOpenMask={.05}
                closedDrawerOffset={-3}
                disabled={false}
                tweenDuration={180}
                negotiatePan={true}
                styles={{ drawer: { shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3, backgroundColor: 'white' } }}
                tweenHandler={(ratio) => ({ mainOverlay: { backgroundColor: `rgba(0, 0, 0, ${ratio / 2})` } })}

                content={
                    <View style={{ flex: 1 }}>

                        {/* Info area */}
                        <View style={{
                            position: 'absolute', left: 0, top: 0, right: 0,
                            height: st * 0.8 * 0.6, backgroundColor: GLOBAL.BAR_COLOR
                        }}>
                            <Image
                                source={require('../images/drawer_cover.png')}
                                style={{ position: 'absolute', top: 0, left: 0, height: st * 0.8 * 0.6, width: st * 0.8 }}
                                resizeMode='stretch' />

                            <View style={{
                                position: 'absolute', left: 0, top: barHeight - 10, right: 0, bottom: 0,
                                justifyContent: 'center', alignItems: 'center' }}>
                                <Image
                                    source={this.state.pictUrl}
                                    style={{ width: st / 5, height: st / 5, borderRadius: this.state.pictBorder }}
                                    resizeMode={this.state.pictResize} />

                                <Text style={{ fontWeight: 'bold', marginTop: 5, color: 'white', backgroundColor: 'transparent' }}>{this.state.userName}</Text>
                                <Text style={{ color: 'white', backgroundColor: 'transparent' }}>{this.state.userID}</Text>
                            </View>

                        </View>

                        {/* Button area */}
                        <View style={{ position: 'absolute', top: st * 0.8 * 0.6, left: 0, right: 0, bottom: 0, margin: 15 }}>

                            <TouchableOpacity onPress={() => this.handleLoginButton()}>
                                <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'center' }}>
                                    <Image
                                        source={this.state.facebookIcon}
                                        style={{ marginRight: 20, width: 25, height: 25, opacity: 0.6 }}
                                        resizeMode='stretch' />
                                    <Text>{this.state.facebookText}</Text>
                                </View>
                            </TouchableOpacity>


                            <TouchableOpacity onPress={() => this.cmdInformation()}>
                                <View style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center' }}>
                                    <Image
                                        source={require('../images/drawer_info.png')}
                                        style={{ marginRight: 20, width: 25, height: 25, opacity: 0.6 }}
                                        resizeMode='stretch' />
                                    <Text>Thông tin</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            >

            {this.renderActionBar()}

            <PopUpSelection ref='mainModal' onEditor={false} />

            </Drawer>
        )
    }

    openProgress() {
        this.facebookProgress.open();
    }

    closeProgress() {
        this.facebookProgress.close();
    }

    //Render items in list
    renderCard(item, index)
    {
        let newDate = moment(item.createdAt).format('DD-MM-YYYY')
        let st = Dimensions.get('window').width + 5;
        return (
            <TouchableOpacity key={index} onPress={() => this.openSelection(item._id)}>
                <View style={{ backgroundColor: 'white', height: st + 105, width: st }}>

                    {/* Title area */}
                    <View style={{ width: st, height: 45, margin: 5, flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={require('../images/logo_khtn_small.png')}
                            style={{ width: 45, height: 37, marginRight: 10, marginLeft: 10 }}
                            resizeMode='stretch' />

                        <Text>{item.description}</Text>
                    </View>

                    {/* Picture area */}
                    <View style={{ width: st, height: st, overflow: 'hidden' }}>
                        <Image
                            source={{ uri: `file://${RNFS.DocumentDirectoryPath}/hcmusavatar_img_${item._id}.png` }}
                            style={{ width: st, height: st }}
                            resizeMode='stretch' />

                        <Image
                            source={{ uri: `file://${RNFS.DocumentDirectoryPath}/hcmusavatar_${item._id}.png`}}
                            style={{ position: 'absolute', top: 0, left: 0, height: st, width: st, opacity: this.state.imgOpactiy }}
                            resizeMode='stretch' />
                    </View>

                    {/* Info area */}
                    <View style={{ height: 45, width: st, paddingLeft: 15, paddingRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                            <Image source={require('../images/icon_calendar.png')} style={{ width: 15, height: 15 }} />
                            <Text style={{ fontSize: 14, marginLeft: 4 }}>{newDate}</Text>
                        </View>

                        <View style={{ flex: 1 }} />

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={require('../images/icon_user.png')} style={{ width: 15, height: 15 }} />
                            <Text style={{ fontSize: 14, marginLeft: 4 }}>{item.num_user}</Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: 'gray', opacity: 0.2, marginRight: 15, marginLeft: 15 }} />
                </View>

            </TouchableOpacity>
        )

    }

    //Render the tabs
    renderActionBar() {
        return (
            <View style={{ flex: 1, backgroundColor: GLOBAL.STATUS_COLOR }} >

                {/* Action bar */}
                <View style={{ backgroundColor: GLOBAL.BAR_COLOR, height: 50, marginTop: barHeight, padding: 5, alignItems: 'center', justifyContent: 'center'}}>
                    <Image
                        source={require('../images/title.png')}
                        style={{ width: 140, height: 15 }}
                        resizeMode='stretch' />
                </View>

                {/* Navigation Drawer button */}
                <TouchableHighlight
                    onPress={() => this.drawer.open()}
                    style={{ position: 'absolute', top: barHeight, left: 0, height: 50, width: 50, justifyContent: 'center', alignItems: 'center' }}
                    underlayColor={GLOBAL.STATUS_COLOR}>
                    <Image
                        source={require('../images/icon_menu_main.png')}
                        style={{ width: 22, height: 20 }}
                        resizeMode='stretch' />
                </TouchableHighlight>

                {this.renderList()}

                <LoadingModal
                    ref={(comp) => this.facebookProgress = comp}
                    loadingText='Đang tải ảnh đại diện Facebook...'/>
                <LoadingModal
                    ref={(comp) => this.fetchingProgress = comp}
                    loadingText='Đang tải dữ liệu từ máy chủ, xin vui lòng đợi...'/>
            </View>
        );
    }

    mapAllItems()
    {
        if (this.state.fetchData !== null && this.state.fetchData.length > 0)
        {
            return(
                this.state.fetchData.map((item, index) => this.renderCard(item, index))
            )
        };
    }

    //Render all items to list
    renderList()
    {
        var loaderSize;
        if (Platform.OS == 'ios')
            loaderSize = 'large'
        else loaderSize = 50;

        let st = Dimensions.get('window').width;

        if (this.state.isConnected)
        {
            if (this.state.isFullyLoaded)
                return(
                    <ScrollView ref={(comp) => this.mainList = comp} style={{ backgroundColor: 'white' }}>
                        { this.mapAllItems() }
                    </ScrollView>
                )
            else
                return(
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'}}>
                        <ActivityIndicator
                            animating={true}
                            style={{width: 100, height: 100}}
                            size={loaderSize}
                        />

                        <Text style={{ width: st - 100, textAlign: 'center' }}>Đang tải dữ liệu hình ảnh, vui lòng chờ...</Text>
                    </View>
                )
        }
        else
        {
            return(
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'}}>
                    <TouchableOpacity onPress={() => {
                        { this.fetchImageData() }
                    }}>
                        <Image
                            source={require('../images/notification_notconnected.png')}
                            resizeMode='center'
                            style={{ marginBottom: 10 }}
                        />
                    </TouchableOpacity>

                    <Text style={{ width: st - 100, textAlign: 'center' }}>
                        Kết nối Internet không khả dụng.{'\n\n'}Chạm vào nút trên để thử lại.
                    </Text>
                </View>
            )
        }
    }
}