import React, { Component } from 'react';
import ReactNative, { NetInfo, StatusBar, View } from 'react-native';
import { Router, Scene } from 'react-native-router-flux';

import WelcomeScene from './scenes/scene_welcome';
import EditorScene from './scenes/scene_editor';
import TabScene from './scenes/scene_tabs';
import LoadingScene from './scenes/scene_loading';

class Main extends Component
{
    componentDidMount() {
        NetInfo.isConnected.addEventListener('change', () => undefined);
    }
    
    render() {
        return(
            <View style={{flex: 1}}>
                <StatusBar
                    backgroundColor={GLOBAL.STATUS_COLOR}
                    barStyle="light-content"
                />

                <Router>
                    <Scene key="root">
                        <Scene key="splash" component={LoadingScene} title="HCMUS Avatar" initial="true" hideNavBar={true}/>
                        <Scene key="welcome" component={WelcomeScene} title="HCMUS Avatar" hideNavBar={true} type='replace'/>
                        <Scene key="tabs" component={TabScene} title="HCMUS Avatar" hideNavBar={true} type='replace'/>
                        <Scene key="editor" component={EditorScene} title="HCMUS Avatar" hideNavBar={true}/>
                        <Scene key="newEditor1" component={EditorScene} title="Edit Your Image" type="replace" hideNavBar={true}/>
                        <Scene key="newEditor2" component={EditorScene} title="Edit Your Image" type="replace" hideNavBar={true}/>
                    </Scene>
                </Router>
            </View>
        )
    }
}

module.exports = Main;