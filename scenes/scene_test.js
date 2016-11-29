import React, {Component} from 'react';
import {
    View,
    Text,
    Dimensions,
    Image
} from 'react-native';

import PhotoView from 'react-native-photo-view';

import {createResponder} from 'react-native-gesture-responder';


export default class Test extends Component {

    constructor(props) {
        super(props);

        this.state = {
            phat: 'nice',
            thumbSize: 100,
        }
    }

    componentWillMount() {
        this.gestureResponder = createResponder({
            onStartShouldSetResponder: (evt, gestureState) => true,
            onStartShouldSetResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetResponder: (evt, gestureState) => true,
            onMoveShouldSetResponderCapture: (evt, gestureState) => true,

            onResponderGrant: (evt, gestureState) => {},
            onResponderMove: (evt, gestureState) => {
                let thumbSize = this.state.thumbSize;
                if (gestureState.pinch && gestureState.previousPinch)
                    thumbSize *= (gestureState.pinch / gestureState.previousPinch);

                this.setState({
                    thumbSize
                });

                console.log(thumbSize);
            },
            onResponderTerminationRequest: (evt, gestureState) => true,
            onResponderRelease: (evt, gestureState) => {},
            onResponderTerminate: (evt, gestureState) => {},
            onResponderSingleTapConfirmed: (evt, gestureState) => {},
            debug: true
        });
    }

    render() {
        const thumbSize = this.state.thumbSize;
        return (
            <View
                style={{flex: 1, backgroundColor: '#66ccff'}}
            >

                <Image
                    style={{
                        width: thumbSize,
                        height: thumbSize,
                        backgroundColor: '#ffffff99',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    {...this.gestureResponder}>
                    <Text >Move or Pinch</Text>
                </Image>

                <Image style={{
                        backgroundColor: 'red', width: 300, height: 300, opacity: 0.3,
                        position: 'absolute', top: 0, left: 0}}
                       {...this.gestureResponder}>
                    <Text>Test View</Text>
                </Image>

            </View>
        );
    }
}
