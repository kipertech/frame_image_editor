import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import Main from './main';

class HCMUSAvatar extends Component 
{
    render() {
        return (
            <Main/>
        );
    }
}

AppRegistry.registerComponent('HCMUSAvatar', () => HCMUSAvatar);
