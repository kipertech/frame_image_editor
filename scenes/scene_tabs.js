import React, { Component } from 'react';
import ReactNative, {
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    StatusBar,
    Dimensions,
    AsyncStorage,
    Alert,
    ListView,
    ActivityIndicator,
    Platform,
    NetInfo
} from 'react-native';

import Menu, {
    MenuContext,
    MenuOptions,
    MenuOption,
    MenuTrigger,
    renderers
} from 'react-native-popup-menu';
import {
    alertLogin,
    loginFb,
    checkLoggedIn,
    checkInternet,
    getProfileImageURL,
    getProfileImageURL2
} from './login';
import Button from 'react-native-button';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import { createAnimatableComponent, View } from 'react-native-animatable';
import { Actions } from 'react-native-router-flux';
import Drawer from 'react-native-drawer';
import PopUpSelection from './modal';
import LoadingModal from './loadingModal';
import {checkPermission, requestPermission} from 'react-native-android-permissions';
import RNFS from 'react-native-fs';
import moment from 'moment';

GLOBAL = require('./global');

const ScrollView = createAnimatableComponent(ReactNative.ScrollView);
const Image = createAnimatableComponent(ReactNative.Image);

export class TabScene extends Component 
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
            userID: 'http://hcmus.edu.vn/',
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
            refreshing: false,
        };
    }

    componentWillMount() {
        checkLoggedIn((data) => {
            if (data != null)
                this.checkFacebook(true);
            else
                this.checkFacebook(false);
        });
        GLOBAL.MAINCOMPONENT = this;
        this.checkConnection();
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
        this.fetchImageData();
    }

    //Fetch image JSON from server
    fetchImageData()
    {
        checkInternet(data => {
            if (data)
            {
                this.refs.progressFetch.open();
                this.setState({refreshing: true});
                fetch(GLOBAL.FATHERLINK + '/users/getimages')
                .then((response) => response.json())
                .then((responseJson) => {
                    this.setState({ fetchData: responseJson });
                    responseJson.reverse().forEach((item, index) => { this.downloadImage(item, index) });
                    this.refs.progressFetch.close();
                    this.setState({refreshing: false});
                })
            }
        })
    }

    //Check if Internet conenction is available
    checkConnection()
    {
        let check = false;
        checkInternet((data) => {
            if (data)
                this.setState({isConnected: true})
            else 
                this.setState({isConnected: false});
            check = data;
        })
        return(check);
    }

    //Download image data from server
    downloadImage(item, index) 
    {
        RNFS.downloadFile({
            fromUrl: GLOBAL.FATHERLINK + `${item.url_avatar}`,
            toFile: `${RNFS.DocumentDirectoryPath}/hcmusavatar_${item._id}.png`,
        }).promise
            .then((result) => { console.log(result) }).done();
     }

    //Update Facebook info to drawer
    checkFacebook(isAvailable) 
    {
        if (isAvailable == true) 
        {
            this.setState(
                {
                    pictUrl: require('../images/stormtrooper.jpg'),
                    pictBorder: 100,
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
                    userID: 'http://hcmus.edu.vn/',
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

        AccessToken.getCurrentAccessToken().then((data) => { alert(data); })
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
                            justifyContent: 'center', alignItems: 'center',
                            height: 170, backgroundColor: GLOBAL.BAR_COLOR
                        }}>
                            <Image
                                source={require('../images/drawer_cover.png')}
                                style={{ position: 'absolute', top: 0, left: 0, height: st * 0.8 * 0.6, width: st * 0.8 }}
                                resizeMode='stretch' />

                            <Image
                                source={this.state.pictUrl}
                                style={{ width: st / 5, height: st / 5, borderRadius: this.state.pictBorder }}
                                resizeMode={this.state.pictResize} />

                            <Text style={{ fontWeight: 'bold', marginTop: 5, color: 'white', backgroundColor: 'transparent' }}>{this.state.userName}</Text>
                            <Text style={{ color: 'white', backgroundColor: 'transparent' }}>{this.state.userID}</Text>
                        </View>

                        {/* Button area */}
                        <View style={{ position: 'absolute', top: 170, left: 0, right: 0, bottom: 0, margin: 15 }}>

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

            </Drawer>
        )
    }

    openProgress() {
        this.refs.progressDialog.open();
    }

    closeProgress() {
        this.refs.progressDialog.close();
    }

    //Render items in list
    renderCard(item, index) {
        let newDate = moment(item.createdAt).format('DD-MM-YYYY')
        let st = Dimensions.get('window').width + 5;
        return (
            <TouchableOpacity key={index} onPress={() => this.openSelection(item._id)}>
                <View
                    style={{ flex: 1, backgroundColor: 'white' }}
                    style={{ backgroundColor: 'white', height: st + 105, width: st }}>

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
                            source={{ uri: GLOBAL.FATHERLINK + `${item.url_img}` }}
                            style={{ width: st, height: st }}
                            resizeMode='stretch' />

                        <Image
                            source={{ uri: GLOBAL.FATHERLINK + `${item.url_avatar}` }}
                            style={{ position: 'absolute', top: 0, left: 0, height: st, width: st, opacity: 1 }}
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
            <View style={{ flex: 1, backgroundColor: 'white' }} >
                <StatusBar
                    backgroundColor={GLOBAL.STATUS_COLOR}
                    barStyle="light-content"
                    />

                {/* Action bar */}
                <View style={{ backgroundColor: GLOBAL.BAR_COLOR, height: 50, padding: 5, alignItems: 'center', justifyContent: 'center'}}>
                    <Image
                        source={require('../images/title.png')}
                        style={{ width: 140, height: 15 }}
                        resizeMode='stretch' />
                </View>
                
                {/* Navigation Drawer button */}
                <TouchableHighlight
                    onPress={() => this.drawer.open()}
                    style={{ position: 'absolute', top: 0, left: 0, height: 50, width: 50, justifyContent: 'center', alignItems: 'center' }}
                    underlayColor={GLOBAL.STATUS_COLOR}>
                    <Image
                        source={require('../images/icon_menu_main.png')}
                        style={{ width: 22, height: 20 }}
                        resizeMode='stretch' />
                </TouchableHighlight>

                {this.renderList()}

                <PopUpSelection ref='mainModal' onEditor={false} />

                <LoadingModal ref='progressDialog' loadingText='Đang tải ảnh đại diện Facebook...'/>
                <LoadingModal ref='progressFetch' loadingText='Đang tải dữ liệu từ máy chủ, xin vui lòng đợi...'/>
            </View>
        );
    }

    renderList() 
    {
        if (this.state.isConnected)
        {
            return(
                <ScrollView ref={(ref) => this.mainList_list = ref}>
                    {this.state.fetchData.map((item, index) => this.renderCard(item, index))}
                </ScrollView>
            );
        }
        else
        {
            return(
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <TouchableOpacity onPress={() => {
                        { this.checkConnection(); }
                        { this.fetchImageData(); }
                    }}>
                        <Image
                            source={require('../images/notification_notconnected.png')}
                            resizeMode='center'
                            style={{ marginBottom: 10 }}
                        />
                    </TouchableOpacity>

                    <Text>Không có kết nối Internet</Text>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    icon: {
        width: 300,
        height: 300,
        alignSelf: 'center',
    },

    navBar: {
        backgroundColor: '#fff',
        borderColor: 'rgba(0,0,0,0.1)',
        height: 40,
        padding: 5,
        elevation: 3,
        alignItems: 'center'
    }
});

module.exports = TabScene;
