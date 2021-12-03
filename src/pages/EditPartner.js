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
import { FlatGrid } from 'react-native-super-grid';
import * as Helper from '../common/Helper';
import CityList from '../common/CityList.json'

import SplashScreen from 'react-native-splash-screen';
import moment from 'moment';


const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const db = firestore()
var currentUser = auth().currentUser;


const EditPartner = (props) => {

  const [clinicName, setClinicName] = useState(props.partnerDetails.name)
  // const [userPhoto, setUserPhoto] = useState("");
  const [address, setAddress] = useState(props.partnerDetails.address);
  const [addressCont, setAddressCont] = useState(props.partnerDetails.addressCont);
  const [selectedValue, setSelectedValue] = useState(props.partnerDetails.city);
  const [stateValue, setStateValue] = useState("Nagaland");
  const [pin, setPin] = useState(props.partnerDetails.pin);
  const [phone, setPhone] = useState(props.partnerDetails.phone[0]);
  const [email, setEmail] = useState("");
  const [selectedID, setSelectedID] = useState(props.partnerDetails.proofType);
  const [proofPath, setProofPath] = useState(props.partnerDetails.proof);

  const [partnerId, setPartnerId] = useState(props.partnerDetails.partnerId)

  const [lastPage, setLastPage] = useState(props.lastPage);
  const [processing, setProcessing] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [bankNameError, setBankNameError] = useState(false);
  const [accountNumberError, setAccountNumberError] = useState(false);
  const [ifscError, setIfscError] = useState(false);
  const [upiError, setUpiError] = useState(false);

  const [bankName, setBankName] = useState(props.partnerDetails.bankName);
  const [accountNumber, setAccountNumber] = useState(props.partnerDetails.accountNumber);
  const [ifscCode, setIfscCode] = useState(props.partnerDetails.ifsc);
  const [upid, setUpid] = useState(props.partnerDetails.upi);

  const nagalandCities = CityList.Nagaland
 
  console.log('partnerDetails.partnerDetails>>>>>>props>>>>>>>>>>>>'+ JSON.stringify (props.partnerDetails))

  useEffect(()=>{
    currentUser = auth().currentUser;
    SplashScreen.hide();
    // getPolicyData();
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
    
  },[])


  const  handleBackButtonClick=()=> {
      console.log('Action.currentbecomepartner pageScene>>>>>>>>>>>>>>>>>>'+Actions.currentScene)
      // console.log('____________________________')
      // console.log('lastPage>>>>>>>>>>>>>>>>>>'+lastPage)
      backAction();
      return true;
    
  }


  const cityOptions=()=>{
    var tempArray = [];
    for(var i=0;i<nagalandCities.length;i++){
      var each = <Picker.Item label={nagalandCities[i]} value={nagalandCities[i]} />
      tempArray.push(each);
    }

    return tempArray;
  }


  const selectImage=()=>{
    launchImageLibrary({selectionLimit:1}, (e)=>{
      console.log(JSON.stringify(e))
      if(e.hasOwnProperty("didCancel") == true){
        Helper.showFlashMessage("No proof selected", global.alert);
      }else{
        setProofPath(e.assets[0].uri); 
      }
       
    })
  }


  const validEmail=(a)=>{
    const regex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
  return regex.test(a);
  }


  const deleteProof=()=>{
    setProofPath("")
  }



  const validateForm=()=>{
    var error = false;
    if(clinicName.length == 0){
      Helper.showFlashMessage("Name invalid", global.alert);
      setNameError(true);
      error = true
    }else{
      setNameError(false);
    }

   
    if(address.length == 0){
      Helper.showFlashMessage("Address invalid", global.alert);
      setAddressError(true)
      error = true
    }else{
      setAddressError(false)
    }


    if(pin.length !== 6){
      Helper.showFlashMessage("Pin code invalid", global.alert);
      setPinError(true)
      error = true
    }else{
      setPinError(false)
    }


    if(phone.length !== 10){
      console.log("phone.length:::"+phone.length)
      Helper.showFlashMessage("Phone number invalid", global.alert);
      setPhoneError(true)
      error = true
    }else{
      setPhoneError(false)
    }


    if(email.length>0){
      var validateEmail = validEmail(email);
      if(validateEmail == false){
        
        Helper.showFlashMessage("Invalid email", global.alert);
        setEmailError(true)
        error = true
      }else{
        setEmailError(false)
      }
    }


    if(proofPath.length == 0){
      Helper.showFlashMessage("Identity Proof not attached", global.alert);
      setFileError(true);
      error = true
    }else{
      setFileError(false);
    }



    if(bankName.length == 0){
      Helper.showFlashMessage("Add bank name", global.alert);
      setBankNameError(true);
      error = true
    }else{
      setBankNameError(false);
    }


    if(accountNumber.toString().length < 9){
      console.log('----------1')
      Helper.showFlashMessage("Invalid account number", global.alert);
      setAccountNumberError(true);
      error = true
    }else{
      console.log('----------2')
      setAccountNumberError(false);
    }


    if(ifscCode.length < 11){
      Helper.showFlashMessage("IFSC code invalid", global.alert);
      setIfscError(true);
      error = true
    }else{
      setIfscError(false);
    }


    if(upid.length < 11){
      Helper.showFlashMessage("IFSC code invalid", global.alert);
      setUpiError(true);
      error = true
    }else{
      setUpiError(false);
    }




    if(error==false){
      console.log("All clear")

        addPartnerRequest()
      
      // processPayment();
    }

  }


  const addPartnerRequest=()=>{
    setProcessing(true)
    var phoneNumber = [];
    phoneNumber.push(phone);
    
    var data = {name: clinicName, address:address, addressCont:addressCont, city:selectedValue, state: stateValue, pin:pin, phone:phoneNumber, proofType: selectedID, createdBy: currentUser.uid, requestDate: moment().unix(), bankName: bankName, accountNumber:accountNumber, ifsc: ifscCode, upi: upid}

    db.collection("partners").doc(partnerId).set(data,{merge:true})
    .then((response) => {
      // console.log();
      // updatePartnerId(response.id)
      uploadUserPhoto()

    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        setProcessing(false)
    });
  }

  //  const updatePartnerId=(id)=>{
  //   db.collection("partners").doc(id).set({partnerId: id},{merge:true})
  //   .then((response) => {
  //     console.log("patner ID updated");

  //   })
  //   .catch((error) => {
  //       console.error("Error writing document: ", error);
  //       setProcessing(false)
  //   });
  // }


//------------upload photo-------------------
const uploadUserPhoto=()=>{

    console.log('Uploading photo::::::::::::::::::::::::'+partnerId)
    console.log('userPhoto::::::::::::::::::::::::'+proofPath)

    if(proofPath.includes("file:///data")){

      storage().ref('partner/'+partnerId+'/'+partnerId+'.jpg').putFile(proofPath)
      .then((response) => {
        console.log("Userphoto uploaded>>>>>>>>>>>>>");
        // updateProofLinkToOrder(id);
        updateUserPhotoToPartner(partnerId)
      })
      .catch((error) => {
          console.error("Error upload document: ", error);
          // setProcessing(false)
          setProcessing(false)
      });

    }else{
      setProcessing(false)
      Actions.dashboard();
    }
  }


  const updateUserPhotoToPartner = async (partnerId)=>{
    var link = await getUserPhotoDownloadUrl(partnerId);
    var data = { proof: link}
    db.collection('partners').doc(partnerId).set(data, {merge:true})
    .then((response) => {
      console.log("User photo updated>>>>>>>>>>>>>");
      setProcessing(false)
      Actions.dashboard();
      
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        setProcessing(false)
        // setProcessing(false)
    });
  }


  const getUserPhotoDownloadUrl = async()=>{
    console.log("getting user download url for "+partnerId);
    var downloadUrl = await storage().ref('partner/'+partnerId+'/'+partnerId+'.jpg').getDownloadURL();
    console.log(downloadUrl);
    return downloadUrl;
  }



  const backAction=()=>{

    if(props.lastPage == 'otp'){
      Actions.dashboard()
    }else{
      Actions.pop()
    }
  }



  
    
  return (
    <View style={{flex:1, backgroundColor:global.background}}>
       <View style={{flexDirection:'row', justifyContent:'space-between', paddingLeft:10, paddingRight:10, height:50, alignItems:'center', marginTop:10}}>
          
          <TouchableOpacity style={{flexDirection:'row', alignItems:'center', paddingLeft:10, height:50}} onPress={()=>{ backAction()}}>
          
            <FontAwesome5 name={'long-arrow-alt-left'} light style={{fontSize:30}}/>
          </TouchableOpacity>


          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image
              style={{height:18,width:18}}
              source={require('../assets/logoGrey.png')}
            />
            <Text style={{fontSize:18, fontWeight:'bold', paddingLeft:5, color:global.info}}>Monaram</Text>

        </View>
      </View>

      <ScrollView contentContainerStyle={{flexGrow:1, marginLeft:'5%', marginRight:'5%', paddingBottom:100}}>
        

        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, borderColor:nameError?'red':global.white, borderWidth:0.5, justifyContent:'center'}}>
            <FontAwesome5 name={'clinic-medical'} light style={{fontSize:14, marginLeft:5}}/>
            <TextInput
              style={{width:'90%', height:50, paddingLeft:10, color:'#000000'}}
              autoCapitalize = {"characters"}
              onChangeText={(text)=>{ var a = text.toUpperCase(); setClinicName(a)}}
              value={clinicName}
              maxLength={30}
              placeholder="CLINIC OR HOSPITAL NAME"
            />
        </View>

        <View style={{marginTop:40, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', borderWidth:0.5, borderColor:addressError?'red':'white'}}>
              <FontAwesome5 name={'map-marker-alt'} light style={{fontSize:14}}/>
              <TextInput
                style={{width:'90%', height:50, paddingLeft:10}}
                onChangeText={(text)=>{setAddress(text)}}
                value={address}
                maxLength={25}
                placeholder="Address"
              />
        </View>

        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center'}}>
              <FontAwesome5 name={'user'} light style={{fontSize:12, color:global.white}}/>
              <TextInput
                style={{width:'90%', height:50, paddingLeft:10}}
                onChangeText={(text)=>{setAddressCont(text)}}
                value={addressCont}
                maxLength={25}
                placeholder="Address (contd.)"
              />
        </View>



        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', borderRadius:5, justifyContent:'center'}}>
              <FontAwesome5 name={'building'} light style={{fontSize:14}}/>
              <Picker
                selectedValue={selectedValue}
                style={{ height: 50, width: '90%' }}
                onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
              >
                {cityOptions()}
              </Picker>
        </View>


        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center'}}>
              <FontAwesome5 name={'map-marker-alt'} light style={{fontSize:14}}/>
              <TextInput
                style={{width:'90%', height:50, paddingLeft:10}}
                onChangeText={(text)=>{setStateValue(text)}}
                value={stateValue}
                editable={false}
                maxLength={10}
                placeholder="State"
              />
        </View>

        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, paddingLeft:20, borderWidth:0.5, borderColor:pinError?'red':'white'}}>
              <FontAwesome5 name={'map-pin'} light style={{fontSize:14}}/>
              <TextInput
                style={{width:'85%', height:50, paddingLeft:10}}
                onChangeText={(text)=>{setPin(text)}}
                value={pin}
                maxLength={6}
                placeholder="Pin"
                keyboardType="numeric"
              />
        </View>


        <View style={{marginTop:50, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, paddingLeft:20, borderWidth:0.5, borderColor:phoneError?'red':'white'}}>
              <FontAwesome5 name={'mobile-android'} light style={{fontSize:14}}/>
              <Text style={{color:global.info, paddingLeft:10}}>+91 |</Text>
              <TextInput
                style={{width:'85%', height:50, paddingLeft:10}}
                onChangeText={(text)=>{setPhone(text)}}
                value={phone}
                maxLength={10}
                placeholder="Mobile Number"
                keyboardType="numeric"
              />
        </View>


        <View style={{marginTop:50, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, paddingLeft:20, borderWidth:0.5, borderColor:emailError?'red':'white'}}>
              <FontAwesome5 name={'envelope-open-text'} light style={{fontSize:14}}/>
              <TextInput
                style={{width:'85%', height:50, paddingLeft:15}}
                onChangeText={(text)=>{setEmail(text)}}
                value={email}
                placeholder="Email"
              />
        </View>


        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', paddingLeft:10}}>
              <FontAwesome5 name={'id-card-alt'} light style={{fontSize:14}}/>
              <Picker
                selectedValue={selectedID}
                style={{ height: 50, width: '90%' }}
                onValueChange={(itemValue, itemIndex) => setSelectedID(itemValue)}
              >
                <Picker.Item label="Aadhaar Card" value="Aadhaar Card" />
                <Picker.Item label="Driving Licence" value="Driving Licence" />
                <Picker.Item label="Voter Id" value="Voter Id" />
                <Picker.Item label="Passport" value="Passport" />
              </Picker>
        </View>

        <View style={{flexDirection:'row', alignItems:'center', marginTop:20}}>
          
            {proofPath.length !== 0?
             <View style={{alignItems:'center', backgroundColor:'white', borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:global.info}} onPress={()=>{selectImage()}}>
               <Image
                  style={{height:80,width:80, borderRadius:5}}
                  source={{uri:proofPath}}
                />
                <TouchableOpacity style={{position:'absolute',top:-10,right:-10, height:30, width:30, backgroundColor:global.text, justifyContent:'center', alignItems:'center', borderRadius:20}} onPress={()=>{deleteProof()}}>
                  <FontAwesome5 name={'trash-alt'} solid style={{fontSize:15, color:'white'}}/>
                </TouchableOpacity>
              </View>
              :

              <TouchableOpacity style={{alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:fileError?'red':global.info}} onPress={()=>{selectImage()}}>
                <Text style={{fontSize:12}}>+ ADD FILE</Text>
              </TouchableOpacity>
            
            }
        </View>


        <View style={{marginTop:50, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, paddingLeft:20, borderWidth:0.5, borderColor:bankNameError?'red':'white'}}>
              <FontAwesome5 name={'university'} light style={{fontSize:14, color:global.text}}/>
              <TextInput
                style={{width:'85%', height:50, paddingLeft:10, color:global.text}}
                onChangeText={(text)=>{setBankName(text)}}
                maxLength={30}
                value={bankName}
                placeholder="Bank Name"
              />
        </View>

        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, paddingLeft:20, borderWidth:0.5, borderColor:accountNumberError?'red':'white'}}>
              <FontAwesome5 name={'money-check-edit'} light style={{fontSize:14, color:global.text}}/>
              <TextInput
                style={{width:'85%', height:50, paddingLeft:10, color:global.text}}
                onChangeText={(text)=>{setAccountNumber(text)}}
                value={accountNumber}
                placeholder="Account Number"
                keyboardType="numeric"
              />
        </View>

        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, paddingLeft:20, borderWidth:0.5, borderColor:ifscError?'red':'white'}}>
              <FontAwesome5 name={'ellipsis-h'} light style={{fontSize:16, color:global.text}}/>
              <TextInput
                style={{width:'85%', height:50, paddingLeft:10, color:global.text}}
                onChangeText={(text)=>{setIfscCode(text)}}
                value={ifscCode}
                placeholder="IFSC Code"
              />
        </View>

        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, paddingLeft:20, borderWidth:0.5, borderColor:upiError?'red':'white'}}>
              <FontAwesome5 name={'map-pin'} light style={{fontSize:14, color:global.white}}/>
              <TextInput
                style={{width:'80%', height:50, paddingLeft:10, color:global.text}}
                onChangeText={(text)=>{setUpid(text)}}
                value={upid}
                placeholder="UPI ID"
              />
              <Image
                  style={{height:30, width:50, borderRadius:5}}
                  source={require('../assets/upi.png')}
                />
        </View>



      </ScrollView>

      {processing?
        <View style={{width:'100%', backgroundColor:global.white, position:'absolute', bottom:0, height:60, justifyContent:'center', alignItems:"center"}}  onPress={()=>{validateForm()}}>
          <View style={{width:'90%', backgroundColor:global.white, height:50, justifyContent:'center', alignItems:"center", borderRadius:5}}>
            <Text style={{color:global.primary, fontSize:18, fontWeight:'bold'}}>Processing..........</Text>
          </View>
        </View>
        :
        <TouchableOpacity style={{width:'100%', backgroundColor:global.background, position:'absolute', bottom:0, height:60, justifyContent:'center', alignItems:"center"}}  onPress={()=>{validateForm()}}>
          <View style={{width:'90%', backgroundColor:global.primary, height:50, justifyContent:'center', alignItems:"center", borderRadius:5}}>
            <Text style={{color:global.white, fontSize:18, fontWeight:'bold'}}>UPDATE</Text>
          </View>
        </TouchableOpacity>      
      }

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

export default EditPartner;
