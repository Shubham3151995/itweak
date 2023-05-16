import React from 'react';
import { SafeAreaView, TouchableOpacity, Text, Keyboard, View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSelector } from 'react-redux';
// import LoadingComp from './components/reuse/LoadingComp';
import { RootState } from './redux/reducers';
// import { getIcons, Icons } from './assets/Icons';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import Config from './utils/Config'
import { scale } from "react-native-size-matters";



/**
 * HOC for including reusable UI logic
 */

const HOC = (ChildComponent: React.FC): React.FC => {
    function InnerHOC(props: any) {
        const state = useSelector(
            (state: RootState) => state
        );
        const loadingStatus = useSelector(
            (state: RootState) => state.LoadingReducer.loadingStatus,
        );
        console.log("next state====>",state);
        
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Config.colors.AppColor,paddingHorizontal:scale(10) }}>
                <StatusBar translucent backgroundColor={Config.colors.white} barStyle="dark-content" />
                <ChildComponent />

                {/* {loadingStatus ? <LoadingComp /> : null} */}
            </SafeAreaView>
        );
    }
    return InnerHOC;
};

const styles = StyleSheet.create({
    
   
})

export default HOC;
