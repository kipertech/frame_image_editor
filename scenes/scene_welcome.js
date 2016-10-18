import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, StatusBar } from 'react-native';
import { Actions } from 'react-native-router-flux'

class WelcomeScene extends Component
{
    render() {
        return(
            <View style={[styles.container]}>
                <StatusBar
                    backgroundColor = 'rgb(76, 96, 106)'
                    barStyle="light-content"
                />

                <View style={{marginLeft: 10, marginRight: 10, justifyContent: 'center', alignItems: 'center'}}>
                    <Image source={require('../images/logo_khtn.png')} style={{width: 165, height: 131, marginBottom: 20}}/>
                    <Text style={styles.welcome}>
                        Chào mừng bạn đến với {'\n'} 
                        HCMUS Avatar 😝
                    </Text>
                    <Text style={styles.instructions}>
                        Ứng dụng này sẽ giúp bạn tạo ra những bức hình đại diện đẹp
                        để hưởng ứng các sự kiện đang diễn ra tại 
                        trường ĐH Khoa Học Tự Nhiên
                    </Text>

                    <TouchableHighlight onPress={() => {Actions.tabs(); }} underlayColor="#ECECEC">
                        <Text style={styles.link}>
                            Nhấn vào đây để bắt đầu!
                        </Text>
                    </TouchableHighlight>
                </View>

                <View style={{position: 'absolute', bottom: 0, left:0, right: 0,justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={styles.copyrights}>
                        Copyrights {'\u00A9'} 2016 Piksal Studio 
                    </Text>
                </View>

            </View>
        )
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(242, 242, 242)',
  },

  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },

  instructions: {
    textAlign: 'center',
    color: '#333333',
    margin: 10,
  },

  link: {
      textAlign: 'center',
      color: 'blue',
      margin: 10
  },

  copyrights: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 10,
    alignSelf: 'stretch',
  }

});

module.exports = WelcomeScene;