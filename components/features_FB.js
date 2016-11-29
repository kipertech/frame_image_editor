import React from 'react';
import { Alert, NetInfo } from 'react-native';
import { Actions } from 'react-native-router-flux'
import { AccessToken, LoginManager } from 'react-native-fbsdk';

export function checkInternet(callback)
{
    try {
        NetInfo.isConnected.fetch().then(isConnected => {
            if (isConnected)
                callback(true)
            else callback(false);
        });
    }
    catch(err)
    {
        console.log('Network Error')
    }
}

export function checkLoggedIn(callback)
{
    checkInternet(data => {
        if (data)
        {
            AccessToken.getCurrentAccessToken().then(
                (data) => {
                    if (data != null && data != undefined) {
                        GLOBAL.TOKEN = data.accessToken;
                        callback(data.accessToken);
                    }
                    else {
                        GLOBAL.TOKEN = null;
                        callback(null);
                    }
                }
            )
        }
        else
        {
            GLOBAL.TOKEN = null;
            callback(null);
            Alert.alert('HCMUS Avatar', 'Không có kết nối Internet, đăng nhập Facebook sẽ không khả dụng')
        }
    })
}

export function alertLogin(isUpload)
{
    Alert.alert(
        'HCMUS Avatar',
        'Để tiếp tục bạn phải đăng nhập vào tài khoản Facebook của mình. Đăng nhập ngay bây giờ?',
        [
            { text: 'Hủy' },
            { text: 'OK', onPress: () => loginFb(isUpload, (data) => console.log(data) ) }
        ]
    )
}

export function loginFb(isUpload, callback)
{
    checkInternet(data => {
        if (data)
        {
            LoginManager.logInWithPublishPermissions(['publish_actions']).then(
                function (result) {
                    if (!result.isCancelled)
                    {
                        AccessToken.getCurrentAccessToken().then(
                            (data) => {
                                GLOBAL.TOKEN = data.accessToken;
                                callback(true);

                                //Open editor if logging in indirectly
                                if (isUpload == false)
                                    getProfileImageURL((data) => {
                                        if (data == false)
                                            Alert.alert('HCMUS Avatar', 'Lỗi trong khi lấy ảnh đại diện từ Facebook, xin vui lòng thử lại sau');

                                        //Close progress dialog
                                        GLOBAL.MAINCOMPONENT.closeProgress();
                                        if (GLOBAL.EDITORCOMPONENT != null)
                                            GLOBAL.EDITORCOMPONENT.closeProgress();
                                    });

                                { GLOBAL.mainCallback(); }

                            }).done();
                    }
                },
                function (error) {
                    Alert.alert(
                        'HCMUS Avatar',
                        'Không thể đăng nhập tài khoản Facebook, vui lòng thử lại sau',
                        [{ text: 'OK' }]
                    );
                    callback(false);
                    GLOBAL.TOKEN = null;
                }
            );
        }
        else
        {
            GLOBAL.TOKEN = null;
            callback(false);
            Alert.alert('HCMUS Avatar', 'Không có kết nối Internet, đăng nhập Facebook không khả dụng')
        }
    })
}

export function getProfileImageURL(callback)
{
    checkInternet(data => {
        if (data)
        {
            GLOBAL.MAINCOMPONENT.openProgress();
            if (GLOBAL.EDITORCOMPONENT != null)
                GLOBAL.EDITORCOMPONENT.openProgress();
            idUrl = `https://graph.facebook.com/me?access_token=${GLOBAL.TOKEN}`;
            fetch(idUrl)
                .then((response) => response.json())
                .then((responseData) => {
                    pictUrl = `https://graph.facebook.com/v2.3/${responseData.id}/picture?width=500&redirect=false&access_token=${GLOBAL.TOKEN}`;
                    fetch(pictUrl)
                        .then(response => response.json())
                        .then(responseData => {
                            getImageUri(responseData.data.url);
                            if (responseData.data.url != null && responseData.data.url != undefined)
                                callback(true)
                            else callback(false);
                        })
                        .done();
                })
                .done();
        }
        else
        {
            Alert.alert('HCMUS Avatar', 'Không có kết nối Internet, không thể lấy hình đại diện từ Facebook')
        }
    })
}

export function getProfileImageURL2(callback) {
    var userName, userID = '';
    idUrl = `https://graph.facebook.com/me?access_token=${GLOBAL.TOKEN}`;
    fetch(idUrl)
        .then((response) => response.json())
        .then((responseData) => {
            userName = responseData.name;
            userID = responseData.id;
            pictUrl = `https://graph.facebook.com/v2.3/${responseData.id}/picture?width=200&redirect=false&access_token=${GLOBAL.TOKEN}`;
            fetch(pictUrl)
                .then(response => response.json())
                .then(responseData => { callback(responseData.data.url, userName, userID) })
                .done();
        })
        .done();
}

export function getImageUri(path) {
    if (GLOBAL.ONEDITOR == false)
        Actions.editor({ data: path });
    else
    {
        if (GLOBAL.CURRENTEDITOR == 1)
        {
            GLOBAL.CURRENTEDITOR = 2;
            Actions.newEditor2({ data: path });
        }
        else
        {
            GLOBAL.CURRENTEDITOR = 1;
            Actions.newEditor1({ data: path });
        }
    }
}
