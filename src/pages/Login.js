/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React,{useState, useEffect} from 'react';
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
  Linking
} from 'react-native';

import auth from '@react-native-firebase/auth';
import * as Helper from '../common/Helper';


import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width



const Login = (props) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [lastPage, setLastPage] = useState(props.lastPage);
  const [becomePartnerRequest, setBecomePartnerRequest] = useState(false);
 console.log("Last page>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+props.lastPage)

  useEffect(()=>{
    if(props.lastPage == 'becomepartner'){
      setBecomePartnerRequest(true)
    }
    
  },[])



  const checkNumber=()=>{
    if(phoneNumber.length !== 10 ){
      Helper.showFlashMessage("Phone number invalid", global.alert);
    }else{
      signIn();
    }
  }



  const signIn=()=>{
    setIsDisabled(true);
    
    
    const phoneNumberEntered = '+91'+ phoneNumber;
    console.log("Signing in>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+phoneNumberEntered)

    auth().signInWithPhoneNumber(phoneNumberEntered)
      .then((confirmResult) =>{ 
        console.log('SigninInconfirmation................'+JSON.stringify(confirmResult)) 
          // this.confirmCode(confirmResult)
          setIsDisabled(false)
          Actions.otp({otpRequest:confirmResult, partnerRequest: becomePartnerRequest})
        })
      .catch((error) => {
        console.log('SigninInError................'+JSON.stringify(error.message) )
         setIsDisabled(false);
        });
  };


  const backAction=()=>{
    if(lastPage == 'dashboard'){
      Actions.pop();
    }else if(lastPage == 'otp'){
      Actions.dashboard();
    }else if(lastPage == 'becomepartner'){
      Actions.pop();
    }
  }


  
  return (
    <View style={{flex:1, backgroundColor:global.background}}>
      <View>
        <TouchableOpacity style={{flexDirection:'row', alignItems:'center', paddingLeft:10, height:50}} onPress={()=>{backAction()}}>
          
          <FontAwesome5 name={'long-arrow-alt-left'} light style={{fontSize:30, color:global.text}}/>
        </TouchableOpacity>
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
          <View style={{width:'90%'}}>
            <Text style={{marginBottom:0, fontSize:18, fontWeight:'bold', color:global.info}}>Login or Register</Text>
            <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5}}>
              <Text style={{color:global.info}}>+91 |</Text>
              <TextInput
                style={{width:'90%', height:50, paddingLeft:10, color:'#000000'}}
                onChangeText={(text)=>{setPhoneNumber(text)}}
                value={phoneNumber}
                maxLength={10}
                placeholder="Mobile Number *"
                keyboardType="numeric"
                placeholderTextColor={global.info}
              />
            </View>
          </View>

          <TouchableOpacity style={{width:'90%', marginTop:30, alignItems:'flex-start', flexDirection:'row'}}  onPress={() => Linking.openURL('https://www.monaram.org/privacy-policy')}>
            <Text style={{color:global.text, fontSize:10}}>By continuing. I agree to the </Text>
            <Text style={{color:global.text, fontSize:10, color:global.primary}}>Terms of Use & Privacy Policy</Text>
          </TouchableOpacity>

          <View style={{width:'90%', marginTop:30}}>
            {isDisabled?
              <View style={{width:'100%', backgroundColor:global.b5b5b5, borderRadius:5, height:50, justifyContent:'center', alignItems:'center'}}>

                <Text style={{color:global.primary, fontWeight:'bold'}}>LOADING ...</Text>

              </View>
              :
              <TouchableOpacity style={{width:'100%', backgroundColor:global.primary, borderRadius:5, height:50, justifyContent:'center', alignItems:'center'}} onPress={()=>{checkNumber()}}>

                <Text style={{color:global.white, fontWeight:'bold'}}>CONTINUE</Text>

              </TouchableOpacity>
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

export default Login;
