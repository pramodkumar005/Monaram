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
  Modal
} from 'react-native';


import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import * as Helper from '../common/Helper';
import moment from 'moment';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import SplashScreen from 'react-native-splash-screen';

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const db = firestore()
var currentUser = auth().currentUser;


const QrCodeReader = () => {

  const [policy, setPolicyData] = useState({});
  const [invalidModal, setInvalidModal] = useState(false);
  const [message, setMessage] = useState("");

  
  useEffect(()=>{
    SplashScreen.hide();
    // getPolicyData();
    console.log('useeffect>>>>>>>>>>>>>>>>>>>>>>>>')
    
  },[])



  const onQRCodeRead=(e)=>{
      console.log(e.data)
      var sanitizedData = e.data.replace(/[^a-zA-Z0-9 ]/g, "");  
        console.log(sanitizedData)
      getPlanData(sanitizedData)
  }


  const getPlanData=(id)=>{
    db.collection("orders").doc(id).get()
    .then((response) => {
      if (response.exists) {
      console.log(">>>>>>>>>>>>>"+JSON.stringify(response.data()));
      setPolicyData(response.data())
      if(moment(response.data().validity,'DD-MM-YYYY')>moment()){
        Actions.addclaim({scannedData: response.data()})
      }else{
        setMessage("Policy has been expired",[setInvalidModal(true)])
      }
      
    }else{
      setMessage("Invalid QR code. Please scan the correct QR code again",[setInvalidModal(true)])
      Actions.dashboard()
    }

    })
    .catch((error) => {
        // console.error("Error writing document: ", error);
        Actions.dashboard()
    });
  }

  
    
  return (
    <View style={{flex:1, backgroundColor:global.background}}>
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <QRCodeScanner
          onRead={(e)=>{onQRCodeRead(e)}}
          cameraStyle={{height:windowHeight, width:windowWidth}}
          topViewStyle={{height:0, width:0}}
          bottomViewStyle={{height:0, width:0}}
        />

        {/*<View style={{position:'absolute', flex:1, flexDirection:'row', alignItems:'center', width:windowWidth}}>
        
                  <View style={{justifyContent:'center', alignItems:'center', backgroundColor:'black', height:windowWidth-50, width:25, opacity:0.3}}>
        
                  </View>
                  
                  <View style={{width:windowWidth-50, height:windowWidth-50, borderWidth:2, borderStyle:'dashed', borderRadius : 1, borderColor: global.white}}>
        
                  </View>
        
                  <View style={{justifyContent:'center', alignItems:'center', backgroundColor:'black', height:windowWidth-50, width:25,  opacity:0.3}}>
        
                  </View>
        
                </View>*/}

        {/*<View style={{position:'absolute', height:(windowHeight - (windowWidth-26))/2, justifyContent:'center', alignItems:'center', backgroundColor:'black', width:'100%', top:0, opacity:0.3}}>
                </View>
        
        
                <View style={{position:'absolute', height:(windowHeight - (windowWidth-26))/2, justifyContent:'center', alignItems:'center', backgroundColor:'black', width:'100%', bottom:0, opacity:0.3}}>
        
                </View>*/}

        <Image
            style={{height:'100%', width:'100%'}}
            resizeMode="cover"
            source={require('../assets/overlay.png')}
          />

        <Text style={{color:global.white, position:'absolute', bottom:30, fontSize:18}}>Scan QR to initiate claim</Text>

        <TouchableOpacity style={{position:'absolute', height:50, justifyContent:'center', alignItems:'center',  width:'100%', top:0, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}} onPress={()=>{Actions.pop()}}>
          <View style={{width:70, height:50, paddingLeft:20, justifyContent:'center'}}>
            <FontAwesome5 name={'long-arrow-alt-left'} light style={{fontSize:30, color:global.white}}/>
          </View>
        </TouchableOpacity>


      </View>


      <Modal
        animationType="slide"
        transparent={true}
        visible={invalidModal}
        onRequestClose={() => {
          setInvalidModal(false)
        }}>
        
        <View style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>

          <View style={{position:'absolute', backgroundColor:'black', flex:1, height:'100%', width:'100%', opacity:0.5, zIndex:0}}>


          </View>
          
          <View style={{width:windowWidth-100, height:300, backgroundColor:global.background, borderRadius:10, justifyContent:'center'}}>
              
              <TouchableOpacity style={{position:'absolute', right:0,top:0, height:40, width:40,  justifyContent:'center', alignItems:'center'}} onPress={()=>{setInvalidModal(false)}}>
                <FontAwesome5 name={'times'} light style={{fontSize:20, marginLeft:5}}/>
              </TouchableOpacity>

              <Text style={{marginLeft:'5%', color:global.primary, fontWeight:'bold'}}>INVALID QR CODE</Text>

              <Text style={{marginLeft:'5%', color:global.text, marginTop:20}}>
                {message}
              </Text>


              <TouchableOpacity style={{alignItems:'center', justifyContent:'center', height:50, width:100, backgroundColor:global.success, marginLeft:'5%', borderRadius:5, marginTop:20}} onPress={()=>{Actions.dashboard()}}>
                <Text style={{color:global.white, fontSize:16}}>CLOSE</Text>
              </TouchableOpacity>

          </View>

        </View>
      </Modal>

       
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

export default QrCodeReader;
