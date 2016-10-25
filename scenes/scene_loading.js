import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, StatusBar, Dimensions } from 'react-native';
import { Actions } from 'react-native-router-flux'
const timer = require('react-native-timer');


class LoadingScene extends Component
{
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false
        }
    }

    showWelcome()
    {
        timer.setTimeout(
            this,
            'ShowWelcome',
            () => {
                if (this.state.isLoaded == false)
                {
                    this.setState({isLoaded: true});
                    Actions.welcome();
                }
            },
            2000
        )
    }

    componentWillMount() {
        this.showWelcome();
    }

    componentDidMount() {
        StatusBar.setHidden(true);
    }

    render() {
        let st = Dimensions.get('window').width, stHeight = Dimensions.get('window').height;
        return(
            <View style={[styles.container]}>
                <StatusBar
                    hidden={true}
                />
                <Image
                    source={require('../images/scene_spash.jpg')}
                    style={{width: st, height: stHeight}}
                    resizeMode='stretch'
                />

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
  }

});

module.exports = LoadingScene;