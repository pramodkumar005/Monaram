/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React,{useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  SectionList,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  TextInput,
  Picker,
  BackHandler
} from 'react-native';


import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import * as Helper from '../common/Helper';
import LottieView from 'lottie-react-native';

import SplashScreen from 'react-native-splash-screen';

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width




const ClaimSuccess = () => {

  const [policy, setPolicyData] = useState({});
  
  
  useEffect(()=>{
    SplashScreen.hide();

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    console.log('useeffect>>>>>>>>>>>>>>>>>>>>>>>>')
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      
    }
    
  },[])


  const  handleBackButtonClick=()=> {
    console.log('Action.currentScene>>>>>>>>claim success>>>>>>>>>>'+Actions.currentScene)
    
      return true;
    
  }

  
    
  return (
    <View style={{flex:1, backgroundColor:global.background, justifyContent:'center', alignItems:'center'}}>
      <View style={{width:windowWidth, height:windowWidth}}>
        <LottieView
          autoPlay 
          loop={false}
          style={{flex:1,justifyContent:'center', alignItems:'center'}}
          source={require('../animations/success.json')}
        />
      </View>

      {/*<View style={{width:windowWidth, height:windowWidth, position:'absolute', top:-100}}>
              <LottieView
                autoPlay 
                loop
                style={{flex:1,justifyContent:'center', alignItems:'center'}}
                source={require('../animations/celebrate.json')}
              />
            </View>*/}

      <View style={{position:'absolute', bottom:(windowHeight/4)-20, alignItems:'center'}}>
        <Text style={{fontWeight:'bold', color:global.success}}>Your claim has been inititated successfully</Text>
        <TouchableOpacity style={{width:100, height:50, borderWidth:1, borderColor:global.primary, alignItems:'center', justifyContent:'center', marginTop:20, borderRadius:5}} onPress={()=>{Actions.dashboard()}}>
          <Text style={{fontSize:14, color:global.primary}}>CLOSE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default ClaimSuccess;
