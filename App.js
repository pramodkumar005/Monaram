/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React,{useEffect, useState} from 'react';
import type {Node} from 'react';
import Routes from './src/Routes';

import FlashMessage from "react-native-flash-message";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Modal,
  TouchableOpacity
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome5';
import NetInfo from "@react-native-community/netinfo";



import './src/common/Theme.js';
import './src/common/Helper.js';

const App: () => Node = () => {

  const [showModal, setShowModal] = useState(false)
  const [reachable, setReachable] = useState(false);

  useEffect(()=>{

    const subscribe = state => {
      setReachable(state.isInternetReachable)
      if (state.isInternetReachable) {
          setShowModal(false)
      }else{
          setShowModal(true)
      }
    };
    


    NetInfo.addEventListener(subscribe);

    return () => {null}
    
  },[])

const checkNetwork=()=>{
NetInfo.fetch().then(state => {
  // console.log("Connection type", state.type);
  console.log("Is connected?", state.isConnected);
  setReachable(state.isConnected)
  if (state.isInternetReachable) {
          setShowModal(false)
      }else{
          setShowModal(true)
      }
});
}


  return (
    <SafeAreaView style={{flex:1}}>
      <Routes/>
      <FlashMessage 
            position="top" 
            floating={true} 
            autoHide={true}
            duration={10000}
            hideOnPress={true}
            renderFlashMessageIcon={()=>{return(<Icon name="times-circle" size={20} light color={global.white} style={{}}/>)}}
          />


          <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        // onRequestClose={() => {
        //   Alert.alert("Modal has been closed.");
        //   setModalVisible(!modalVisible);
        // }}
        >

        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <View style={{flex:1, position:'absolute', backgroundColor:'black', width:'100%', height:'100%', opacity:0.6}}>
           
          </View>
          <View style={{width: '90%', backgroundColor:'white', height:300, borderRadius:10, justifyContent:'center', alignItems:'center'}}>
            <Icon name="wifi" size={50} color="grey"/>
            <Text style={{marginTop:20}}>NO NETWORK</Text>
            <TouchableOpacity style={{justifyContent:'center', alignItems:'center', width:150, backgroundColor: global.primary, height:30, padding:5, marginTop:10, borderRadius:5}} onPress={()=>{checkNetwork()}}>
              <Text style={{color:global.white}}>CONNECT NOW</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>



    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  
});

export default App;
