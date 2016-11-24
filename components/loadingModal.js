import React, { Component } from 'react';
import { Text, ActivityIndicator, Dimensions, Platform } from 'react-native';
import Modal from 'react-native-modalbox';

let st = Dimensions.get('window');

export default class LoadingModal extends Component
{
    constructor(props) {
        super(props);
    }

    propTypes: {
        loadingText: React.PropTypes.string;
    }

    open() 
    {
        this.mainModal.open();
    }

    close()
    {
        this.mainModal.close();
    }

    //Render Progress Dialog
    render()
    {
        var loaderSize;
        if (Platform.OS == 'ios')
            loaderSize = 'large'
        else loaderSize = 50;

        //Main render function
        return(
            <Modal {...this.props}
                ref={(component) => this.mainModal = component}
                style={{ flexDirection: 'row', height: 100, width: st.width - 100, alignItems: 'center' }}
                position={'center'}
                backButtonClose={false}
                backdropPressToClose={false}
                swipeToClose={false}
                backdropOpacity={0.7}
                animationDuration={100}>

                <ActivityIndicator
                    animating={true}
                    style={{width: 100, height: 100}}
                    size={loaderSize}
                />

                <Text style={{fontSize: 15, width: st.width - 200 - 10}}>{this.props.loadingText}</Text>
            </Modal>
        )
    }
}