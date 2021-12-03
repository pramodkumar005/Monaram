/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React,{useState, useEffect, useRef} from 'react';
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
  TextInput,
  BackHandler
} from 'react-native';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import * as Helper from '../common/Helper';


import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const db = firestore()
var currentUser = auth().currentUser;


const Otp = (props) => {
  const [otp01, setOtp01] = useState();
  const [otp02, setOtp02] = useState();
  const [otp03, setOtp03] = useState();
  const [otp04, setOtp04] = useState();
  const [otp05, setOtp05] = useState();
  const [otp06, setOtp06] = useState();
  const [signInObject, setSignInObject] = useState(props.otpRequest);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isTimerOn, setIsTimerOn] = useState(true);

  const [recievedFCMToken, setRecievedFCMToken] = useState(true);
  const [FCMToken, setFCMToken] = useState("");

  const [becomePartnerRequest, setBecomePartnerRequest] = useState(props.partnerRequest);

  const [role, setRole] = useState();

  const ref01 = useRef(null);
  const ref02 = useRef(null);
  const ref03 = useRef(null);
  const ref04 = useRef(null);
  const ref05 = useRef(null);
  const ref06 = useRef(null);

  const [secs, setSecs] = useState(120)

  useEffect(()=>{
    
    if(recievedFCMToken == true){
      getFCMToken()
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    const timerId = setInterval(() => {
      if (secs <= 0) {

        setIsTimerOn(false);
      }
      else setSecs(s => s - 1)
    }, 1000)
    return () => {
      backHandler.remove()
      clearInterval(timerId)
    };
  },[secs])


  const  handleBackButtonClick=()=> {
    console.log('Action.currentScene>>>>>>>>otp>>>>>>>>>>'+Actions.currentScene)
    
      return true;
    
  }


  const getFCMToken= async()=>{

    const fcmToken = await messaging().getToken();
    if (fcmToken) {
     console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+fcmToken);
     setRecievedFCMToken(false)
     setFCMToken(fcmToken)
    
    } else {
     console.log("Failed", "No token received::::::::::::::::::::::::::::::::::::::");
    }
  }




 const confirmCode=()=>{
    setIsDisabled(true)
    var code = ''+ otp01 + otp02 + otp03 + otp04  + otp05  + otp06

    signInObject.confirm(code)
    .then((result) => {
        
        

        if(result.additionalUserInfo.isNewUser){
            //new user create data
          global.role = "user";
          setRole("user");
          updateUsersProfile(result.user, result.additionalUserInfo.isNewUser, "user");
        }else{
          checkRoleAndUpdate(result.user);
        }

        


        
      })
    .catch((error) => {
         console.log('confirmCode fail................'+JSON.stringify(error.message))
         Helper.showFlashMessage("Invalid OTP", global.alert);
         setIsDisabled(false)
      });
  }


  const checkRoleAndUpdate=(userData, isNewUser)=>{
   db.collection("profile").doc(auth().currentUser.uid).get()
    .then((response) => {
     console.log('otp++++++++++>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+JSON.stringify(response.data().role))
      global.role = response.data().role;
      setRole(response.data().role,[updateUsersProfile(userData, isNewUser, response.data().role)])
      
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
       
    });
  }



  const updateUsersProfile=(userData, isNewUser, userRole)=>{
    console.log(userData.uid)
    var userProfileData;
    if(isNewUser){
      userProfileData = {uid: userData.uid, phone:userData.phoneNumber, name: userData.displayName, photo:userData.photoURL, role:"user", fcmToken: FCMToken}
    }else{
      userProfileData = {fcmToken: FCMToken}
    }
    


    db.collection("profile").doc(userData.uid).set(userProfileData,{merge:true})
    .then((response) => {
      // console.log('Setting userdata+++++++++++++++++++++++++++++++++++++++++++++'+JSON.stringify(userData))
      global.userData = userData;
      global.isUserLoggedIn = true;
      if(becomePartnerRequest){
        Actions.becomepartner({lastPage:"otp"});
      }else{
        Actions.dashboard({role:userRole});
      }
      
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        setIsDisabled(false)
    });
  }



  return (
    <View style={{flex:1, backgroundColor:global.background}}>
      <View style={{width:'100%', height:50, justifyContent:'center'}}>
        <View style={{flexDirection:'row', alignItems:'center', paddingLeft:10, height:50}}>
          
        </View>
      </View>
     
      <View style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image
              style={{height:25,width:25}}
              source={require('../assets/logo.png')}
            />
            <Text style={{fontSize:25, fontWeight:'bold', color:global.primary}}> Monaram</Text>
        </View>
        <View style={{width:'100%',alignItems:'center', marginTop:80}}>
          <View style={{width:'90%', alignItems:'center', marginLeft:'5%', marginRight:'5%'}}>
            <Text style={{marginBottom:5, fontSize:18, fontWeight:'bold', color:global.text}}>Verify with OTP</Text>
            <Text style={{marginBottom:5, fontSize:12, color:global.text}}>Sent via SMS </Text>
            <View style={{marginTop:20, flexDirection:'row', alignItems:'center', paddingLeft:5, justifyContent:'center'}}>
              <TextInput
                style={{width:40, height:40, paddingLeft:0, backgroundColor:'white', borderRadius:5, color:global.black, justifyContent:'center', alignItems:'center', textAlign:'center', borderRadius:20}}
                onChangeText={(text)=>{setOtp01(text); if(text !==""){ref02.current.focus()} }}
                value={otp01}
                maxLength={1}
                keyboardType="numeric"
                ref={ref01}
              />

              <TextInput
                style={{width:40, height:40, paddingLeft:0, backgroundColor:'white', borderRadius:5, marginLeft:10, color:global.black, textAlign:'center', borderRadius:20}}
                onChangeText={(text)=>{setOtp02(text); if(text !==""){ref03.current.focus()} }}
                value={otp02}
                maxLength={1}
                keyboardType="numeric"
                ref={ref02}
              />

              <TextInput
                style={{width:40, height:40, paddingLeft:0, backgroundColor:'white', borderRadius:5,  marginLeft:10, color:global.black, textAlign:'center', borderRadius:20}}
                onChangeText={(text)=>{setOtp03(text); if(text !==""){ref04.current.focus()} }}
                value={otp03}
                maxLength={1}
                keyboardType="numeric"
                ref={ref03}
              />

              <TextInput
                style={{width:40, height:40, paddingLeft:0, backgroundColor:'white', borderRadius:5,  marginLeft:10, color:global.black, textAlign:'center', borderRadius:20}}
                onChangeText={(text)=>{setOtp04(text); if(text !==""){ref05.current.focus()} }}
                value={otp04}
                maxLength={1}
                keyboardType="numeric"
                ref={ref04}
              />

               <TextInput
                style={{width:40, height:40, paddingLeft:0, backgroundColor:'white', borderRadius:5,  marginLeft:10, color:global.black, textAlign:'center', borderRadius:20}}
                onChangeText={(text)=>{setOtp05(text); if(text !==""){ref06.current.focus()} }}
                value={otp05}
                maxLength={1}
                keyboardType="numeric"
                ref={ref05}
              />

               <TextInput
                style={{width:40, height:40, paddingLeft:0, backgroundColor:'white', borderRadius:5,  marginLeft:10, color:global.black, textAlign:'center', borderRadius:20}}
                onChangeText={(text)=>{setOtp06(text); }}
                value={otp06}
                maxLength={1}
                keyboardType="numeric"
                ref={ref06}
              />
            </View>
          </View>

          {/*<View style={{width:'90%', marginTop:30, flexDirection:'row', alignItems:'center'}}>
            <Text style={{color:global.info, fontSize:14}}>By continuing. I agree to the </Text>
            <Text style={{color:global.info, fontSize:14, color:global.primary}}>Terms of Use & Privacy Policy</Text>
          </View>*/}

          <View style={{width:'90%', marginTop:30}}>
            {isDisabled?
              <View style={{width:'100%', height:50, justifyContent:'center', alignItems:'center'}}>

              <Text style={{color:global.primary, fontWeight:'bold'}}>Verifying ...</Text>

              </View>
              :
              <View style={{alignItems:'center'}}>
                <TouchableOpacity style={{width:'85%', backgroundColor:global.primary, borderRadius:5, height:50, justifyContent:'center', alignItems:'center'}} onPress={()=>{confirmCode()}}>

                  <Text style={{color:global.white, fontWeight:'bold'}}>VERIFY NOW</Text>

                </TouchableOpacity>

                {isTimerOn?
                  <View style={{justifyContent:'center', alignItems:'center', height:40, marginTop:30, width:200}}>
                 <Text style={{ fontSize: 12, color:global.text }}>Resend OTP in {secs} sec</Text>
                </View>
                :
                <TouchableOpacity style={{justifyContent:'center', alignItems:'center', height:40, marginTop:30, width:100}}  onPress={()=>{Actions.login({lastPage:'otp'})}}>
                  <Text style={{color:global.primary}}>Resend OTP</Text>
                </TouchableOpacity>
                }

              </View>
            }
          </View>

        </View>

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

export default Otp;
