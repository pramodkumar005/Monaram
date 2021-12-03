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

import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

import ImageResizer from 'react-native-image-resizer';

import SplashScreen from 'react-native-splash-screen';
import moment from 'moment';


const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const db = firestore()
var currentUser = auth().currentUser;


// const sampleData = {"orderDate":1636717331,"validity":"12-11-2022","dob":"10-11-1992","phone":"9999999911","email":"auser11@monaram.com","policyNumber":"WQySnWxYfxJeUGl5BT1A","uid":"9fRAXifGh1c5tFHV370EaYC5paE3","qrCode":"https://firebasestorage.googleapis.com/v0/b/monaram-4bdb9.appspot.com/o/QrCode%2FWQySnWxYfxJeUGl5BT1A.png?alt=media&token=adfd2956-67db-4fa8-b45a-a450be988e6e","proofLink":"https://firebasestorage.googleapis.com/v0/b/monaram-4bdb9.appspot.com/o/proof%2FWQySnWxYfxJeUGl5BT1A.jpg?alt=media&token=34a2e293-c99f-4534-8ed8-6fece1d68b54","pin":"235678","city":"Dimapur","fullName":"User 11","transactionId":"pay_IKgBcBdP0aLTEP","proofType":"Driving Licence","plan":{"validity":"1 Year","planId":"KEc2KxBWl880WWOYM7S7","logo":"https://firebasestorage.googleapis.com/v0/b/monaram-4bdb9.appspot.com/o/assets%2Faccidental_log.png?alt=media&token=70a6033f-6e68-4f77-8771-6d6c1ef3001d","backColor":"#ffe7c2","initiatedClaimAmount":0,"annualPremium":500,"orderBy":1,"status":true,"name":"Accidental Protect","description":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","image":"https://firebasestorage.googleapis.com/v0/b/monaram-4bdb9.appspot.com/o/assets%2Finjury.png?alt=media&token=e8fb6b58-f80d-4def-92b1-53b245e6d7b1","smallIntro":"Low payment double benefit","benefitAmount":[{"value":50000,"name":"Accidental Death","initiatedAmount":0},{"value":5000,"name":"Personal Accidental","initiatedAmount":0},{"value":2000,"name":"Accidental Dental","initiatedAmount":0}],"benefits":[{"value":"₹ 50000","label":"Accidental Death"},{"value":"₹ 5000","label":"Personal Accident"},{"value":"₹ 2000","label":"Accidental Dental"},{"value":"0-70 Years","label":"Age Limit"}]},"state":"Nagaland","address":"4122 factoria","gender":1,"addressCont":"Lane no 3"}

const AddClaim = (props) => {

  console.log('MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM'+JSON.stringify(props.scannedData))

  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [policyData, setPolicyData] = useState(props.scannedData);
  // const [policyData, setPolicyData] = useState(sampleData);


  const [injuryPhoto, setInjuryPhoto] = React.useState([
    { name: 'TURQUOISE', uri: 'https://via.placeholder.com/150', type:'dummy' }
  ]);

  const [userPhoto, setUserPhoto] = useState("");
  const [billPhoto, setBillPhoto] = useState("");
  const [claimAmount, setClaimAmount] = useState(0);
  const [imagePreview, setImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(policyData.proofLink);

  const [insuranceType, setInsuranceType] = useState(0);
  const [insuranceTypeSelected, setInsuranceTypeSelected] = useState({});
  const [insuranceTypeOptions, setInsuranceTypeOptions] = useState([]);

  const [userPhotoError, setUserPhotoError] = useState(false)
  const [injuryPhotoError, setInjuryPhotoError] = useState(false)
  const [billPhotoError, setBillPhotoError] = useState(false)
  const [claimError, setClaimError] = useState(false)
  const [processing, setProcessing] = useState(false)

  const [partnerId, setPartnerId] = useState("")

  const [initiatedLabel, setInitiatedLabel] = useState(false);

  useEffect(()=>{
    SplashScreen.hide();
    // getPolicyData();
    getPartnerDetails();

    setInsuranceTypeOption();
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    console.log('useeffect>>>>>>>>>>>>>>>>>>>>>>>>')
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    }
    
  },[injuryPhoto])


  const  handleBackButtonClick=()=> {
    console.log('Action.currentScene>>>>>>>>>>>>>>>>>>'+Actions.currentScene)
      Actions.dashboard();
      return true;
  }


  const getPartnerDetails=()=>{
    db.collection("profile")
    .doc(auth().currentUser.uid)
    .get()
    .then((response) => {
     console.log('add claim++++++++++>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+JSON.stringify(response.data().partnerID))
     setPartnerId(response.data().partnerID)
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
       
    });

  }


  const setInsuranceTypeOption =()=>{
    var tempArray=[];

    for (var i = 0; i < policyData.plan.benefitAmount.length; i++) {
      var eachElement = {label: policyData.plan.benefitAmount[i].name, value: policyData.plan.benefitAmount[i].value, initiatedAmount: policyData.plan.benefitAmount[i].initiatedAmount }

      tempArray.push(eachElement)
    }
    console.log('+++++++++++++yo++++++++++'+JSON.stringify(policyData.plan.benefitAmount[0]))
    setInsuranceTypeOptions(tempArray)
    
    setInsuranceTypeSelected(policyData.plan.benefitAmount[0])
  }


  // const getPolicyData=()=>{
  //   db.collection("orders").doc("NVLQVszJDqrcbIt7KCrN").get()
  //   .then((response) => {
  //     console.log(">>>>>>>>>>>>>"+JSON.stringify(response.data()));
  //     setPolicyData(response.data())
  //   })
  //   .catch((error) => {
  //       console.error("Error writing document: ", error);
  //   });
  // }



  const selectUserPhoto=()=>{
    launchCamera({selectionLimit:1}, (e)=>{
      
      if(e.hasOwnProperty("didCancel") == true){
        Helper.showFlashMessage("No face photo selected", global.alert);
      }else{
        console.log(JSON.stringify('++++++++++++++++'+e.assets[0].uri))
        ImageResizer.createResizedImage(e.assets[0].uri, global.imageHeight, global.imageWidth, 'JPEG', global.quality, 0)
          .then(response => {
            console.log('mmmmmmselectBillPhotommmmmmmmmmmmm>>>>'+JSON.stringify(response))
            setUserPhoto(response.uri); 
            
          })
          .catch(err => {
            console.log(err)
            
          });
        // setUserPhoto(e.assets[0].uri); 
      }
    })
  }

  const selectBillPhoto=()=>{
    launchCamera({selectionLimit:1}, (e)=>{
      
      if(e.hasOwnProperty("didCancel") == true){
        Helper.showFlashMessage("No bill photo selected", global.alert);
      }else{
        console.log(JSON.stringify('++++++++++++++++'+e.assets[0].uri))
        setBillPhoto(e.assets[0].uri); 
      }
    })
  }


  const selectInjuryPhoto=()=>{
    console.log(injuryPhoto.length);
    if(injuryPhoto.length<6){
      launchCamera({selectionLimit:1}, (e)=>{
        if(e.hasOwnProperty("didCancel") == true){
          Helper.showFlashMessage("No photo selected", global.alert);
        }else{

          ImageResizer.createResizedImage(e.assets[0].uri, global.imageHeight, global.imageWidth, 'JPEG', global.quality, 0)
          .then(response => {
            // console.log('mmmmmmselectBillPhotommmmmmmmmmmmm>>>>'+JSON.stringify(response))
            // setUserPhoto(response.uri); 

            console.log(JSON.stringify('++++++++++++++++'+response.uri))
            var tempArray = [];
            tempArray = injuryPhoto;
            var newPhoto =  { uri: response.uri, type:'photo' }
            tempArray.push(newPhoto);
            setInjuryPhoto([...tempArray]);
            
          })
          .catch(err => {
            console.log(err)
            
          });
        }
      })
    }else{
      Helper.showFlashMessage("Maximum 5 photos allowed", global.alert);
    }
  }

  const deleteInjuryPhoto=(index)=>{
    console.log(index);
    var tempArray = [];
    tempArray = injuryPhoto;
    console.log('Before:::'+tempArray.length)
    tempArray.splice(index,1);
    console.log('After:::'+tempArray.length)
    setInjuryPhoto([...tempArray]);
  }


  const validateClaim=()=>{
    setUserPhotoError(false)
    setInjuryPhotoError(false)

    if(userPhoto.length == 0){
       Helper.showFlashMessage("Please upload user photo", global.alert);
       setUserPhotoError(true)
    }else if(injuryPhoto.length <= 1){
       Helper.showFlashMessage("Please upload injury photo", global.alert);
       setInjuryPhotoError(true)
    }else{
      console.log("All clear")
      addClaim();
    }
  }



  const addClaim=()=>{
    setProcessing(true)

    console.log('+++++++insuranceTypeSelected+++++++++++'+JSON.stringify(insuranceTypeSelected))


    var data = {policy: policyData, createDate:moment().unix(), createdBy: auth().currentUser.uid, claimSum: claimAmount, status:'initiated', selectedInsuranceType: insuranceTypeSelected, partnerID: partnerId };

    db.collection("claims").add(data)
    .then((response) => {
      console.log(response.id);
      uploadUserPhoto(response.id);
      updateClaimId(response.id)
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        setProcessing(false)
    });
  }



  const updateClaimId=(claimId)=>{
    var data = {claimId: claimId}
    db.collection("claims").doc(claimId).set(data,{merge:true})
    .then((response) => {
      
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        setProcessing(false)
    });
  }


  // ---------------------userphoto---------------------------
  const uploadUserPhoto=(claimId)=>{
    storage().ref('claims/'+claimId+'/userPhoto/'+claimId+'.jpg').putFile(userPhoto)
    .then((response) => {
      console.log("Userphoto uploaded>>>>>>>>>>>>>");
      // updateProofLinkToOrder(id);
      updateUserPhotoToClaim(claimId)
    })
    .catch((error) => {
        console.error("Error upload document: ", error);
        setProcessing(false)
    });
  }


  const updateUserPhotoToClaim = async (claimId)=>{
    var link = await getUserPhotoDownloadUrl(claimId);
    var data = { userPhoto: link}
    db.collection("claims").doc(claimId).set(data, {merge:true})
    .then((response) => {
      console.log("User photo updated>>>>>>>>>>>>>");
      uploadInjuryPhotoUrls(claimId)
      // uploadBillPhoto(claimId);
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        setProcessing(false)
    });
  }


  const getUserPhotoDownloadUrl = async(claimId)=>{
    console.log("getting user download url for "+claimId);
    var downloadUrl = await storage().ref('claims/'+claimId+'/userPhoto/'+claimId+'.jpg').getDownloadURL();
    console.log(downloadUrl);
    return downloadUrl;
  }

// ---------------------bill photo---------------------------

  // const uploadBillPhoto=(claimId)=>{
  //   storage().ref('claims/'+claimId+'/billPhoto/'+claimId+'.jpg').putFile(billPhoto)
  //   .then((response) => {
  //     console.log("Bill photo uploaded>>>>>>>>>>>>>");
  //     // updateProofLinkToOrder(id);
  //     updateBillPhotoToClaim(claimId);
  //   })
  //   .catch((error) => {
  //       console.error("Error upload document: ", error);
  //       setProcessing(false)
  //   });
  // }


  // const updateBillPhotoToClaim = async (claimId)=>{
  //   var link = await getBillPhotoDownloadUrl(claimId);
  //   var data = { billPhoto: link}
  //   db.collection("claims").doc(claimId).set(data, {merge:true})
  //   .then((response) => {
  //     console.log("bill photo updated>>>>>>>>>>>>>");
  //     uploadInjuryPhotoUrls(claimId)
  //   })
  //   .catch((error) => {
  //       console.error("Error writing document: ", error);
  //       setProcessing(false)
  //   });
  // }


  // const getBillPhotoDownloadUrl = async(claimId)=>{
  //   console.log("getting user bill url for "+claimId);
  //   var downloadUrl = await storage().ref('claims/'+claimId+'/billPhoto/'+claimId+'.jpg').getDownloadURL();
  //   // console.log(downloadUrl);
  //   return downloadUrl;
  // }


  

// ---------------------injury photo---------------------------
    
    const uploadInjuryPhotoUrls=async(claimId)=>{


      for (var i = 1; i < injuryPhoto.length ; i++) {

        var url = await uploadInjuryPhoto(claimId, injuryPhoto[i].uri, i, injuryPhoto.length);
        // setTimeout(() => console.log('waiting for 5000---------'), 5000);

      }
      
      
    }


    const uploadInjuryPhoto=(claimId, photoPath, index, injuryPhotoArrayLength)=>{
      console.log('index::::::::::::::::::::'+index)
    storage().ref('claims/'+claimId+'/injuryPhoto/'+claimId+'_'+index+'.jpg').putFile(photoPath)
    .then(async(response) => {
      console.log("Injury photo uploaded>>>>>>>>>>>>>");
      // updateProofLinkToOrder(id);
       var link = await getInjuryPhotoDownloadUrl(claimId, photoPath, index);
       updateInjuryPhotoToClaim(claimId, link, index, injuryPhotoArrayLength)
       return link;
    })
    .catch((error) => {
        console.error("Error upload document: ", error);
        return null;
        setProcessing(false)
    });
  }


  const getInjuryPhotoDownloadUrl = async(claimId, photoPath, index)=>{
    console.log("getting Injury url for "+claimId+"-------"+index);
    var downloadUrl = await storage().ref('claims/'+claimId+'/injuryPhoto/'+claimId+'_'+index+'.jpg').getDownloadURL();
    // console.log(downloadUrl);
    return downloadUrl;
  }


  const updateInjuryPhotoToClaim = (claimId, link, index, injuryPhotoArrayLength)=>{
    

    
    db.collection("claims").doc(claimId).set({injuryPhotos: firestore.FieldValue.arrayUnion(link)}, {merge:true})
    .then((response) => {
      console.log("injury phtot updated on fb>>>>>>>>>>>>>");
      if(index == (injuryPhotoArrayLength-1)){
        console.log("All photos uploaded---------------------------------")
        setProcessing(false)
        Actions.claimsuccess();
      }
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        setProcessing(false)
    });
  }



  const benefitAmount =(e)=>{
    console.log('eeeeeeeeeeeeeeeeeeeeee'+JSON.stringify(e))
    var tempArray = [];
    if(e.length !== null){
      for (var i = 0; i < e.length; i++) {
       var eachElement =  <Text style={{color:global.text, fontSize:10}}>{e[i].name}: ₹ {e[i].value}</Text>
       tempArray.push(eachElement)
      }
    }

    return tempArray;
  }


  const benefitInitiatedAmount =(e)=>{
    var tempArray = [];
    if(e.length !== null){
      for (var i = 0; i < e.length; i++) {
        var eachElement;
        if(e[i].initiatedAmount >0){
          eachElement =  <Text style={{color:global.text, fontSize:10}}>₹ {e[i].initiatedAmount}</Text>
          // setInitiatedLabel(true)
          
        }else{
          eachElement =  <Text style={{color:global.text, fontSize:10}}>-</Text>
        }

        tempArray.push(eachElement)
       
      }
    }

    return tempArray;
  }
  
    
  return (
    <View style={{flex:1, backgroundColor:global.background}}>
       <View style={{flexDirection:'row', justifyContent:'space-between', paddingLeft:10, paddingRight:10, height:50, alignItems:'center', marginTop:10}}>
          
          {processing?
            <View style={{flexDirection:'row', alignItems:'center', paddingLeft:10, height:50}}>
          
              <FontAwesome5 name={'long-arrow-alt-left'} light style={{fontSize:30, color: global.background}}/>
            </View>
            :
            <TouchableOpacity style={{flexDirection:'row', alignItems:'center', paddingLeft:10, height:50}} onPress={()=>{ Actions.dashboard()}}>
            
              <FontAwesome5 name={'long-arrow-alt-left'} light style={{fontSize:30, color: global.text}}/>
            </TouchableOpacity>
            }

          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image
              style={{height:18,width:18}}
              source={require('../assets/logoGrey.png')}
            />
            <Text style={{fontSize:18, fontWeight:'bold', paddingLeft:5, color:global.info}}>Monaram</Text>

          </View>
      </View>
      
      <View style={{height:100, width:'90%', marginLeft:'5%', justifyContent:'space-between', alignItems:'center', backgroundColor:global.white, borderRadius:10, marginTop:10, flexDirection:'row', padding:10, marginBottom:10}}>
          <View style={{paddingLeft:10, height:'100%', justifyContent:'space-between'}}>
             <View>
                <Text style={{fontSize:12, fontWeight:'bold', color: global.text}}>{policyData.plan.name}</Text>
                <Text style={{fontSize:10, marginTop:5, color: global.text}}>Policy Id: {policyData.policyNumber}</Text>
                <Text style={{fontSize:10, color: global.text}}>Name: {policyData.fullName}</Text>
             </View>

             

            <View>
              
              <Text style={{fontSize:10, marginTop:0, color: global.text}}>Expire on: {policyData.validity}</Text>
            </View>
          </View>

          <TouchableOpacity style={{width:'25%', justifyContent:'center', alignItems:'center', height:'100%'}} onPress={()=>{setImagePreview(true)}}>
            <View style={{justifyContent:'center', alignItems:'center', width:60, height:60, backgroundColor:global.border, borderRadius:10}}>
              <Image
                style={{height:50,width:50, borderRadius:10}}
                source={{uri: policyData.proofLink}}
              />
            </View>
            <Text style={{fontSize:9, marginTop:8, color: global.info}}>( ID PROOF )</Text>
          </TouchableOpacity>
      </View>

      
      <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:5, width:'90%', marginLeft:'5%'}}>
        <View>
          <Text style={{color:global.info, fontSize:9, marginBottom:3}}>AVAILABLE BALANCE</Text>
            {benefitAmount(policyData.plan.benefitAmount)}
          
        </View>
        
        <View>
          <Text style={{color:global.info, fontSize:9, marginBottom:3}}>INITIATED AMOUNT</Text>
          {benefitInitiatedAmount(policyData.plan.benefitAmount)}
        </View>
     </View>

     
      <ScrollView contentContainerStyle={{flexGrow:1, paddingLeft:'5%', width:'90%', marginTop:10, paddingBottom:100}} showsVerticalScrollIndicator={false}>

      <View style={{}}>
        <Text style={{fontSize:10, color:global.primary, marginBottom:10, borderBottomWidth:0.5, paddingBottom:5, borderColor:global.info}}>FACE PHOTO *</Text>
        
        {userPhoto.length !==0?
          <View style={{alignItems:'center', backgroundColor:'white', borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:global.info, marginLeft:10}} onPress={()=>{selectUserPhoto()}}>
           <Image
              style={{height:80,width:80, borderRadius:5}}
              source={{uri:userPhoto}}
            />
            <TouchableOpacity style={{position:'absolute',top:-10,right:-10, height:30, width:30, backgroundColor:global.text, justifyContent:'center', alignItems:'center', borderRadius:20}} onPress={()=>{setUserPhoto("")}}>
              <FontAwesome5 name={'trash-alt'} solid style={{fontSize:15, color:'white'}}/>
            </TouchableOpacity>
          </View>
         :
        
        <TouchableOpacity style={{alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:userPhotoError?global.alert:global.info, marginLeft:10}} onPress={()=>{selectUserPhoto()}}>
          <Text style={{fontSize:10, color: global.text}}>+ ADD FILE</Text>
        </TouchableOpacity>
        }
      </View>

        <View style={{marginTop:30}}>
          <View style={{marginBottom:10, borderBottomWidth:0.5, paddingBottom:5, borderColor:global.info, flexDirection:'row'}}>
            <Text style={{fontSize:10, color:global.primary}}>INJURY PHOTOS *</Text>
            <Text style={{fontSize:9, color:global.text, paddingLeft:5}}>(minimum 1 and maximum 5 can be added)</Text>
          </View>
          {/*<TouchableOpacity style={{alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:global.info}} onPress={()=>{}}>
                      <Text style={{fontSize:12}}>+ ADD FILE</Text>
                    </TouchableOpacity>*/}

          <FlatGrid
              itemDimension={85}
              data={injuryPhoto}
              style={styles.gridView}
              // staticDimension={300}
              // fixed
              extraData ={injuryPhoto}
              spacing={10}
              renderItem={({ item, index }) => (
                <View style={{height:100, justifyContent:'center'}}>
                  {item.type == 'dummy'?
                    <TouchableOpacity style={{alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor: injuryPhotoError? global.alert:global.info}} onPress={()=>{selectInjuryPhoto()}}>
                      <Text style={{fontSize:10, color: global.text}}>+ ADD FILE</Text>
                    </TouchableOpacity>
                    :
                    <View style={{alignItems:'center', backgroundColor:'white', borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:global.info, marginLeft:10}}>
                       <Image
                          style={{height:80,width:80, borderRadius:5}}
                          source={{uri:item.uri}}
                        />
                        <TouchableOpacity style={{position:'absolute',top:-10,right:-10, height:30, width:30, backgroundColor:global.text, justifyContent:'center', alignItems:'center', borderRadius:20}} onPress={()=>{deleteInjuryPhoto(index)}}>
                          <FontAwesome5 name={'trash-alt'} solid style={{fontSize:15, color:'white'}}/>
                        </TouchableOpacity>
                    </View>
                  }
                </View>
              )}
            />

        </View>

        <View style={{marginTop:30}}>
          <View style={{marginBottom:10, borderBottomWidth:0.5, paddingBottom:5, borderColor:global.info, flexDirection:'row'}}>
            <Text style={{fontSize:10, color:global.primary}}>CLAIM TYPE *</Text>
          </View>
          <RadioForm
            radio_props={insuranceTypeOptions}
            formHorizontal={false}
            initial={insuranceType}
            buttonColor={global.primary}
            selectedButtonColor={global.primary}
            buttonSize={20}
            radioStyle={{padding:10}}
            onPress={(value, index) => {setInsuranceType(value); setInsuranceTypeSelected(policyData.plan.benefitAmount[index]); console.log('----------------------'+JSON.stringify(policyData.plan.benefitAmount[index]))}}
          />

        </View>


        {/*<View style={{marginTop:30}}>
                  <Text style={{fontSize:10, color:global.primary, marginBottom:10, borderBottomWidth:0.5, paddingBottom:5, borderColor:global.info}}>BILL / PRESCRIPTION PHOTO *</Text>
                  {billPhoto.length !==0?
                    <View style={{alignItems:'center', backgroundColor:'white', borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:global.info, marginLeft:10}} onPress={()=>{selectBillPhoto()}}>
                     <Image
                        style={{height:80,width:80, borderRadius:5}}
                        source={{uri:billPhoto}}
                      />
                      <TouchableOpacity style={{position:'absolute',top:-10,right:-10, height:30, width:30, backgroundColor:global.text, justifyContent:'center', alignItems:'center', borderRadius:20}} onPress={()=>{setBillPhoto("")}}>
                      <FontAwesome5 name={'trash-alt'} solid style={{fontSize:15, color:'white'}}/>
                    </TouchableOpacity>
                  </View>
                  :
                    <TouchableOpacity style={{alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:billPhotoError ? global.alert:global.info, marginLeft:10}} onPress={()=>{selectBillPhoto()}}>
                      <Text style={{fontSize:12}}>+ ADD FILE</Text>
                    </TouchableOpacity>
                  }
                </View>*/}

        
            {/*<View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, borderColor:claimError?global.alert:global.white, borderWidth:1}}>
                          <FontAwesome5 name={'rupee-sign'} light style={{fontSize:15, marginLeft:5}}/>
                          <TextInput
                            style={{width:'90%', height:50, paddingLeft:10, color:'#000000'}}
                            onChangeText={(text)=>{setClaimAmount(text)}}
                            value={claimAmount}
                            maxLength={10}
                            placeholder="Claim amount *"
                            keyboardType="numeric"
                          />
                        </View>*/}

            {/*<View style={{width:'100%', alignItems:'flex-end', marginTop:5}}>
              <Text style={{fontSize:11}}>Claim balance: ₹ {policyData.plan.balance}</Text>
            </View>*/}

      </ScrollView>

      <View>
        {processing?
          <View style={{height:50, width:'90%', left:'5%', justifyContent:'center', alignItems:'center', marginBottom:5, borderRadius:5}}>
            <Text style={{fontWeight:'bold', fontSize:14, color:global.primary}}>Processing ...</Text>
          </View>
        :
          <TouchableOpacity style={{height:50, backgroundColor:global.primary, width:'90%', left:'5%', justifyContent:'center', alignItems:'center', marginBottom:5, borderRadius:5}} onPress={()=>{validateClaim()}}>
            <Text style={{fontWeight:'bold', fontSize:14, color:global.white}}>ADD CLAIM</Text>
          </TouchableOpacity>
        }

      </View>

       {processing?
          <View style={{flex:1, position:'absolute', height:'100%', width:'100%'}}>

          </View>
          :
          null
        }


        {imagePreview?
          <View style={{flex:1, position:'absolute', top:0, backgroundColor:global.black, height:'100%', width:'100%'}}>
            
            <TouchableOpacity style={{position:'absolute',top:0, right:10, padding:15, zIndex:10}} onPress={()=>{setImagePreview(false)}}>
              <FontAwesome5 name={'times'} light style={{fontSize:25, color:global.white}}/>
            </TouchableOpacity>

            <Image
              resizeMode="contain"
              style={{height:'100%',width:'100%', borderRadius:5}}
              source={{uri:selectedImage}}
            />
         
          </View>
          :null
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

export default AddClaim;
