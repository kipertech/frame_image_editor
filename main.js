import React, { Component } from 'react';
import { NetInfo, StatusBar, View } from 'react-native';
import { Router, Scene } from 'react-native-router-flux';

import WelcomeScene from './scenes/scene_welcome';
import EditorScene from './scenes/scene_editor';
import ListScene from './scenes/scene_list';
import LoadingScene from './scenes/scene_loading';

export default class Main extends Component
{
    componentDidMount() {
        NetInfo.isConnected.addEventListener('change', () => undefined);
    }

    render() {
        return(
            <View style={{flex: 1}}>
                <StatusBar
                    backgroundColor={'rgba(0, 0, 0, 0.1)'}
                    translucent={true}
                    barStyle="light-content"/>

                <Router>
                    <Scene key="root" hideNavBar={true}>
                        <Scene key="splash" component={LoadingScene} title="HCMUS Avatar" initial="true" />
                        <Scene key="welcome" component={WelcomeScene} title="HCMUS Avatar" type='replace'/>
                        <Scene key="tabs" component={ListScene} title="HCMUS Avatar" type='replace'/>
                        <Scene key="editor" component={EditorScene} title="HCMUS Avatar"/>
                        <Scene key="newEditor1" component={EditorScene} title="Edit Your Image" type="replace" hideNavBar={true}/>
                        <Scene key="newEditor2" component={EditorScene} title="Edit Your Image" type="replace" hideNavBar={true}/>
                    </Scene>
                </Router>
            </View>
        )
    }
}