import React, { Component } from 'react';
import ReactNative, {
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TouchableHighlight,
    StatusBar,
    Dimensions,
    AsyncStorage,
    Alert,
    ListView
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
        };
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
                    }
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

    componentWillMount() {
        checkLoggedIn((data) => {
            if (data != null)
                this.checkFacebook(true);
            else
                this.checkFacebook(false);
        });
        GLOBAL.MAINCOMPONENT = this;
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

                            <Text style={{ fontWeight: 'bold', marginTop: 5, color: 'white' }}>{this.state.userName}</Text>
                            <Text style={{ color: 'white' }}>{this.state.userID}</Text>
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

    //Render items in list
    renderCard(id, title, imageSource, mainImageSource, opa, time, usetime, delayTime) {
        let st = Dimensions.get('window').width + 5;
        return (
            <TouchableOpacity onPress={() => this.openSelection(id)}>
                <View 
                    animation="bounceInUp" duration={500} delay={delayTime}
                    style={{ flex: 1, backgroundColor: 'white' }}
                    style={{ backgroundColor: 'white', height: st + 105, width: st }}>

                    {/* Title area */}
                    <View style={{ width: st, height: 45, margin: 5, flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={require('../images/logo_khtn_small.png')}
                            style={{ width: 45, height: 37, marginRight: 10, marginLeft: 10 }}
                            resizeMode='stretch' />

                        <Text>{title}</Text>
                    </View>

                    {/* Picture area */}
                    <View style={{ width: st, height: st, overflow: 'hidden' }}>
                        <Image
                            animation="fadeIn" duration={1000} delay={500}
                            source={mainImageSource}
                            style={{ width: st, height: st }}
                            resizeMode='stretch' />

                        <Image
                            animation="fadeIn" duration={1000} delay={1500}
                            source={imageSource}
                            style={{ position: 'absolute', top: 0, left: 0, height: st, width: st, opacity: opa }}
                            resizeMode='stretch' />
                    </View>

                    {/* Info area */}
                    <View style={{ height: 45, width: st, paddingLeft: 15, paddingRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={require('../images/icon_calendar.png')} style={{ width: 15, height: 15 }} />
                            <Text style={{ fontSize: 14, marginLeft: 4 }}>{time}</Text>
                        </View>

                        <View style={{ flex: 1 }} />

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={require('../images/icon_user.png')} style={{ width: 15, height: 15 }} />
                            <Text style={{ fontSize: 14, marginLeft: 4 }}>{usetime}</Text>
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
                <View style={{ backgroundColor: GLOBAL.BAR_COLOR, height: 50, padding: 5, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
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

                {/* Grid view butotn */}
                <TouchableHighlight
                    onPress={() => {
                        if (this.state.currentView == 'list')
                            this.setState({currentView: 'grid', gridviewImage: require('../images/icon_view_list.png'), gridImageMode: 'center'})
                        else this.setState({currentView: 'list', gridviewImage: require('../images/icon_view_grid.png'), gridImageMode: 'stretch'});
                    }}
                    style={{ position: 'absolute', top: 0, right: 0, height: 50, width: 50, justifyContent: 'center', alignItems: 'center' }}
                    underlayColor={GLOBAL.STATUS_COLOR}>
                    <Image
                        source={this.state.gridviewImage}
                        style={{ width: 22, height: 20 }}
                        resizeMode={this.state.gridImageMode} />
                </TouchableHighlight>

                {this.renderList()}

                <PopUpSelection ref='mainModal' onEditor={false} />
            </View>
        );
    }

    //Render card in grid view
    renderGridCard(imageSource, eventHandler, delayTime) {
        let st = Dimensions.get('window').width / 3;
        return(
            <TouchableOpacity onPress={eventHandler}>
                <View
                    animation="fadeIn" duration={delayTime}
                    style = {{width: st, height: st, alignItems: 'center', justifyContent: 'center'}} >

                    <Image
                        source={imageSource}
                        style={{ width: st, height: st }}
                        resizeMode='stretch' />

                </View>
            </TouchableOpacity>
        )
    }

    renderGridRow(link1, id1, delay1, link2, id2, delay2, link3, id3, delay3) {
        let st = Dimensions.get('window').width / 3;
        return(
            <View style={{height: st, width: st*3 + 5 , flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                { this.renderGridCard(link1, () => this.openSelection(id1), delay1)}
                { this.renderGridCard(link2, () => this.openSelection(id2), delay2)}
                { this.renderGridCard(link3, () => this.openSelection(id3), delay3)}
            </View>
        )
    }

    scrollToTop()
    {
        this.mainList_list.scrollTo({x: 0});
        this.mainList_grid.scrollTo({x: 0});
    }

    renderList() {
        if (this.state.currentView == 'list')
        {
            return(
                <ScrollView ref={(ref) => this.mainList_list = ref}>
                    {this.renderCard(6, 'Mừng ngày Phụ nữ Việt Nam', require('../images/overlay_women.png'), require('../images/profile_sample2.png'), 1, '20/10/2016', '100')}
                    {this.renderCard(1, 'Mừng kỷ niệm 60 năm', require('../images/overlay_60year.png'), require('../images/profile_sample.png'), 1, '01/01/2017', '213')}
                    {this.renderCard(2, 'Ủng hộ LGBT', require('../images/overlay_lgbt.png'), require('../images/profile_sample3.jpg'), 0.7, '15/10/2016', '123')}
                    {this.renderCard(3, 'Mừng Giáng Sinh', require('../images/overlay_christmas.png'), require('../images/profile_tamtit.jpg'), 1, '24/12/2016', '1234')}
                    {this.renderCard(4, 'Chúc mừng năm mới!', require('../images/overlay_newyear.png'), require('../images/profile_midu.jpg'), 0.7, '01/01/2016', '869')}
                    {this.renderCard(5, 'Công dân kiểu mẫu', require('../images/overlay_model.png'), require('../images/profile_kieutrinh.jpg'), 0.8, '05/06/2015', '56')}
                </ScrollView>
            );
        }
        else
        {
            return(
                <ScrollView ref={(ref) => this.mainList_grid = ref}>
                    { this.renderGridRow(
                        require('../images/overlay_60year.png'),
                        1,
                        500,
                        require('../images/overlay_lgbt.png'),
                        2,
                        1000,
                        require('../images/overlay_christmas.png'),
                        3,
                        1500             
                    )}

                    { this.renderGridRow(
                        require('../images/overlay_newyear.png'),
                        4,
                        2000,
                        require('../images/overlay_model.png'),
                        5,
                        2500,
                        require('../images/overlay_women.png'),
                        6,
                        3000
                    )}
                </ScrollView>
            );
        };
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
