import React, { Component } from 'react';
import { View, Text, ActivityIndicator, Dimensions } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker'
import Modal from 'react-native-modalbox';

export default class LoadingModal extends Component {
    constructor(props) {
        super(props);
    }

    open() 
    {
        this.refs.progressDialog.open();
    }

    close() 
    {
        this.refs.progressDialog.close();
    }

    //Render Progress Dialog
    render()
    {
        let st = Dimensions.get('window').width;
        return(
            <Modal {...this.props}
                style={{ flexDirection: 'row', height: 100, width: st - 100, alignItems: 'center' }}
                position={'center'} ref={'progressDialog'} 
                backButtonClose={false}
                backdropPressToClose={false}
                swipeToClose={false}
                backdropOpacity={0.7}
                animationDuration={100}
                >

                <ActivityIndicator
                    animating={true}
                    style={{width: 100, height: 100}}
                    size={50}
                />

                <Text style={{fontSize: 15, width: st - 200 - 10}}>{this.props.loadingText}</Text>
            </Modal>
        )
    }
}