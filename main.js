import React, { Component } from 'react';
import { Router, Scene } from 'react-native-router-flux';

import WelcomeScene from './scenes/scene_welcome';
import EditorScene from './scenes/scene_editor';
import TabScene from './scenes/scene_tabs';

class Main extends Component
{
    render() {
        return(
            <Router>
                <Scene key="root">
                    <Scene key="welcome" component={WelcomeScene} title="HCMUS Avatar" initial="true" hideNavBar={true}/>
                    <Scene key="tabs" component={TabScene} title="HCMUS Avatar" hideNavBar={true} type='replace'/>
                    <Scene key="editor" component={EditorScene} title="HCMUS Avatar" hideNavBar={true}/>
                    <Scene key="newEditor" component={EditorScene} title="Edit Your Image" type="replace" hideNavBar={true}/>
                </Scene>
            </Router>
        )
    }
}

module.exports = Main;