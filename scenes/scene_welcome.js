import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Actions } from 'react-native-router-flux'

class WelcomeScene extends Component
{
    render() {
        let st = Dimensions.get('window').width, stHeight = Dimensions.get('window').height;
        return(
            <View style={[styles.container]}>
                <StatusBar
                    hidden={true}
                />

                <TouchableOpacity onPress={() => Actions.tabs()}>
                    <Image
                        source={require('../images/scene_welcome.png')}
                        style={{width: st, height: stHeight}}
                        resizeMode='stretch'
                    />
                </TouchableOpacity>

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