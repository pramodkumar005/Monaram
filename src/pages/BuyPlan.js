/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React,{useState, useEffect, useCallback, useRef } from 'react';
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
  PermissionsAndroid
} from 'react-native';


import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';
import DateTimePicker from '@react-native-community/datetimepicker';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import * as Helper from '../common/Helper';
import RazorpayCheckout from 'react-native-razorpay';
import RNQRGenerator from 'rn-qr-generator';

import { Modalize } from 'react-native-modalize';

import ImageResizer from 'react-native-image-resizer';

import moment from 'moment';
import CityList from '../common/CityList.json'

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const db = firestore()
var currentUser = auth().currentUser;



const BuyPlan = ({selectedData}) => {

  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [gender, setGender] = useState(0);
  const [address, setAddress] = useState('');
  const [addressCont, setAddressCont] = useState('');
  const [selectedValue, setSelectedValue] = useState("Dimapur");
  const [stateValue, setStateValue] = useState("Nagaland");
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState(global.userData.phoneNumber.substring(3));
  const [email, setEmail] = useState("");
  const [selectedID, setSelectedID] = useState("Aadhaar Card");
  const [proofPath, setProofPath] = useState("");
  const [proofFileAvailable, setProofPathAvailable] = useState(false);
  const [paymentId,setPaymentID] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [planData, setPlanData] = useState(selectedData)

  const [orderIsInProcess, setOrderIsInProcess] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const [nameError, setNameError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [fileError, setFileError] = useState(false);


  const addImagePopup = useRef<Modalize>(null);


  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const [displayDate, setDisplayDate] = useState("Date of birth");

  const genderOptions = [{label: 'MALE', value: 0 },{label: 'FEMALE', value: 1 }];

  const nagalandCities = CityList.Nagaland

 
  useEffect(()=>{
    currentUser = auth().currentUser;
  },[])



  const checkCameraPermission=()=>{
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)
    .then(async(response) => { 
      console.log('camera permission>>>>>>>'+response) 

      if(response === false){

          const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera permisssion',
            message:
              'Monaram needs access to your camera ' +
              'to take photo required for completing the action.',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('You can use the camera');
            selectCameraPhoto()
          } else {
            setModalVisible(false)
            console.log('Camera permission denied');
            Helper.showFlashMessage("Camera action denied. Go to settings > apps and enable camera ", global.alert);

          }
      }else{
        selectCameraPhoto()
      }

    })
  }

  const onChange = (event, selectedDate) => {
    // const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(selectedDate);
    setDisplayDate(moment(selectedDate).format('DD-MM-YYYY'))
    console.log(moment(selectedDate).format('DD/MM/YYYY'))

  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };


  const genderSelect=(e)=>{
    setGender(e)
    console.log(e)
  }


  const cityOptions=()=>{
    var tempArray = [];
    for(var i=0;i<nagalandCities.length;i++){
      var each = <Picker.Item label={nagalandCities[i]} value={nagalandCities[i]} />
      tempArray.push(each);
    }

    return tempArray;
  }



  const onOpenAddImage = () => {
    addImagePopup.current?.open();
  };

  const onCloseAddImage = () => {
    addImagePopup.current?.close();
  };


  const selectImage=()=>{
    onCloseAddImage();
    launchImageLibrary({selectionLimit:1}, (e)=>{
      console.log(JSON.stringify(e))
      if(e.hasOwnProperty("didCancel") == true){
        Helper.showFlashMessage("No proof selected", global.alert);
        onCloseAddImage();
      }else{
        ImageResizer.createResizedImage(e.assets[0].uri, global.imageHeight, global.imageWidth, 'JPEG', global.quality, 0)
          .then(response => {
            console.log('mmmmmmselectBillPhotommmmmmmmmmmmm>>>>'+JSON.stringify(response))
            setProofPath(response.uri,[setProofPathAvailable(true)])
            onCloseAddImage()
            
          })
          .catch(err => {
            console.log(err)
            
          });
        // setProofPath(e.assets[0].uri,[setProofPathAvailable(true)]); 
      }
       
    })
  }


  const selectCameraPhoto=()=>{
    onCloseAddImage();
    launchCamera({selectionLimit:1}, (e)=>{

      console.log('LLLLLLLLLLLLLLLLLLLLLLLL::::::'+JSON.stringify(e))
      
      if(e.hasOwnProperty("didCancel") == true){
        Helper.showFlashMessage("No image selected", global.alert);
        onCloseAddImage();
      }else{
        ImageResizer.createResizedImage(e.assets[0].uri, global.imageHeight, global.imageWidth, 'JPEG', global.quality, 0)
          .then(response => {
            console.log('mmmmmmselectBillPhotommmmmmmmmmmmm>>>>'+JSON.stringify(response))
            setProofPath(response.uri,[setProofPathAvailable(true)])
            onCloseAddImage()
            
          })
          .catch(err => {
            console.log(err)
            
          });
        // setUserPhoto(e.assets[0].uri); 
      }
    })
  }



  

  const deleteProof=()=>{
    setProofPathAvailable(false);
    setProofPath("");
  }


  const validEmail=(a)=>{
    const regex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
  return regex.test(a);
  }


  const validateForm=()=>{
    var error = false;
    if(name.length == 0){
      Helper.showFlashMessage("Name invalid", global.alert);
      setNameError(true);
      error = true
    }else{
      setNameError(false);
    }

    if(displayDate == "Date of birth"){
      Helper.showFlashMessage("Select date of birth", global.alert);
      setDateError(true)
      error = true
    }else{
      setDateError(false)
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


    if(proofFileAvailable == false){
      Helper.showFlashMessage("Identity Proof not attached", global.alert);
      setFileError(true);
      error = true
    }else{
      setFileError(false);
    }

    if(error==false){
      processPayment();
    }

  }




  const uploadProof =(id)=>{
    storage().ref('proof/'+id+'.jpg').putFile(proofPath)
    .then((response) => {
      console.log("proof uploaded>>>>>>>>>>>>>");
      updateProofLinkToOrder(id);
    })
    .catch((error) => {
        console.error("Error upload document: ", error);
    });    
  }


  const updateProofLinkToOrder = async (id)=>{
    var link = await getProofDownloadUrl(id);
    var data = { proofLink: link, policyNumber:id};
  
    db.collection("orders").doc(id).set(data, {merge:true})
    .then((response) => {
      console.log("proof link updated>>>>>>>>>>>>>");
      Helper.showFlashMessage("Order placed successfully", global.success);
      setOrderIsInProcess(false);
      setOrderCompleted(true);

    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
  }



  const getProofDownloadUrl = async(id)=>{
    console.log("getting download url for "+id);
    var downloadUrl = await storage().ref('proof/'+id+'.jpg').getDownloadURL();
    console.log(downloadUrl);
    return downloadUrl;
  }


  const createOrder=(paymentId)=>{
    console.log('creating order>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    var validity = Number(planData.validity.split(' ')[0]);
    var data = {fullName: name, dob:moment(date).format("DD-MM-YYYY"), gender:gender, address:address, addressCont:addressCont, city:selectedValue, state: stateValue, pin:pin, phone:phone, proofType: selectedID, validity: moment().add(1, 'years').format("DD-MM-YYYY"), transactionId: paymentId, plan: planData, uid: currentUser.uid, orderDate: moment().unix(), email:email};
  
    db.collection("orders").add(data)
    .then((response) => {
      console.log(response.id);
      generateQrCode(response.id);
      setPolicyNumber(response.id);
      uploadProof(response.id);
      
      // Helper.showFlashMessage("Order placed successfully", global.success);
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
   }


  const processPayment=()=>{
    setOrderIsInProcess(true)

    var emailData =""
    if(email.length >0){
      emailData = email;
    }else{
      emailData = "monaram.ngl@gmail.com";
    }


    var options = {
            description: 'Payment for MonAram',
            image: 'https://asset001.s3.ap-southeast-1.amazonaws.com/monAram_logo.png',
            currency: 'INR',
            key: global.razorKey, // Your api key
            amount: Number(planData.annualPremium) * 100,
            name: name,
            prefill: {
              email: emailData,
              contact: phone,
              name: 'Monaram'
            },
            theme: {color: '#f37083'}
          }
          RazorpayCheckout.open(options).then((data) => {
            // handle success
            console.log('>>>>>>>>>>>>'+JSON.stringify( data))
            // alert(`Success: ${data.razorpay_payment_id}`);
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>.."+data.razorpay_payment_id);
            setPaymentID(data.razorpay_payment_id,[createOrder(data.razorpay_payment_id)]);
            
          }).catch((error) => {
            // handle failure
            
            var a = JSON.parse(error.description);
            console.log('>>>>>>>>>>>>'+( a.error.description))
            Helper.showFlashMessage(a.error.description, global.alert);
            setOrderIsInProcess(false)
            // alert(`Error: ${error.code} | ${error.description}`);
          });
  }



  const generateQrCode=(orderID)=>{
    RNQRGenerator.generate({
      value: orderID,
      height: 400,
      width: 400,
    })
      .then(response => {
        const { uri, width, height, base64 } = response;
        // this.setState({ imageUri: uri });
        console.log('QR Code generated+++++++++++++++++++++++++++'+uri)
        uploadQrCodeImageToFB(uri, orderID);
      })
      .catch(error => console.log('Cannot create QR code', error));
  }


  const uploadQrCodeImageToFB=(uri, orderID)=>{
    storage().ref('QrCode/'+orderID+'.png').putFile(uri)
    .then((response) => {
      console.log("QrCode uploaded>>>>>>>>>>>>>");
      // updateProofLinkToOrder(id);
      updateQRLinkToOrder(orderID)
    })
    .catch((error) => {
        console.error("Error upload document: ", error);
    });
  }


  const updateQRLinkToOrder = async (id)=>{
    var link = await getQRDownloadUrl(id);
    var data = { qrCode: link};
  
    db.collection("orders").doc(id).set(data, {merge:true})
    .then((response) => {
      console.log("QR Code updated>>>>>>>>>>>>>");

    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
  }


  const getQRDownloadUrl = async(id)=>{
    console.log("getting qr code download url for "+id);
    var downloadUrl = await storage().ref('QrCode/'+id+'.png').getDownloadURL();
    console.log(downloadUrl);
    return downloadUrl;
  }


  
  
    
  return (
    <View style={{flex:1, backgroundColor:global.background}}>
      <View style={{flexDirection:'row', justifyContent:'space-between', paddingLeft:10, paddingRight:10, height:50, alignItems:'center', marginTop:10}}>
          
          <TouchableOpacity style={{flexDirection:'row', alignItems:'center', paddingLeft:10, height:50}} onPress={()=>{Actions.pop()}}>
          
            <FontAwesome5 name={'long-arrow-alt-left'} light style={{fontSize:30, color:global.text}}/>
          </TouchableOpacity>


          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image
              style={{height:18,width:18}}
              source={require('../assets/logoGrey.png')}
            />
            <Text style={{fontSize:18, fontWeight:'bold', paddingLeft:5, color:global.info}}>Monaram</Text>

          </View>
      </View>

      <ScrollView contentContainerStyle={{flexGrow:1, paddingBottom:80,paddingLeft:'5%', paddingRight:'5%'}}>
        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', borderWidth:0.5, borderColor:nameError?'red':'white'}}>
              <FontAwesome5 name={'user'} light style={{fontSize:14, color:global.text}}/>
              <TextInput
                style={{width:'90%', height:50, paddingLeft:10, color:global.text}}
                onChangeText={(text)=>{setName(text)}}
                value={name}
                maxLength={30}
                placeholder="Full name"
                placeholderTextColor={global.info}
              />
        </View>

        <TouchableOpacity style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', borderWidth:0.5, borderColor:dateError?'red':'white'}} onPress={showDatepicker}>
              <FontAwesome5 name={'calendar-check'} light style={{fontSize:14, color:global.text}}/>
              <View style={{width:'90%', height:50, paddingLeft:10,  justifyContent:'center'}}>
                <Text style={{color:global.info}}>{displayDate}</Text>
              </View>
        </TouchableOpacity>


        <View style={{marginTop:40, flexDirection:'row', alignItems:'center', paddingLeft:10, borderRadius:5, backgroundColor:'white'}}>
              
              <RadioForm
                radio_props={genderOptions}
                formHorizontal={true}
                initial={gender}
                buttonColor={global.primary}
                selectedButtonColor={global.primary}
                buttonSize={20}
                radioStyle={{padding:10}}
                onPress={(value) => {genderSelect(value)}}
              />
        </View>

        <View style={{marginTop:40, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', borderWidth:0.5, borderColor:addressError?'red':'white'}}>
              <FontAwesome5 name={'map-marker-alt'} light style={{fontSize:14, color:global.text}}/>
              <TextInput
                style={{width:'90%', height:50, paddingLeft:10, color:global.text}}
                onChangeText={(text)=>{setAddress(text)}}
                value={address}
                maxLength={25}
                placeholder="Address"
                placeholderTextColor={global.info}
              />
        </View>

        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center'}}>
              <FontAwesome5 name={'user'} light style={{fontSize:12, color:global.white}}/>
              <TextInput
                style={{width:'90%', height:50, paddingLeft:10, color:global.text}}
                onChangeText={(text)=>{setAddressCont(text)}}
                value={addressCont}
                maxLength={25}
                placeholder="Address (contd.)"
                placeholderTextColor={global.info}
              />
        </View>



        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', borderRadius:5, justifyContent:'center'}}>
              <FontAwesome5 name={'building'} light style={{fontSize:14, color:global.text}}/>
              <Picker
                selectedValue={selectedValue}
                style={{ height: 50, width: '90%', color:global.text }}
                onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
                placeholderTextColor={global.info}
              >
                {cityOptions()}
              </Picker>
        </View>


        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center'}}>
              <FontAwesome5 name={'map-marker-alt'} light style={{fontSize:14, color:global.text}}/>
              <TextInput
                style={{width:'90%', height:50, paddingLeft:10, color:global.info}}
                onChangeText={(text)=>{setStateValue(text)}}
                value={stateValue}
                editable={false}
                maxLength={10}
                placeholder="State"
                placeholderTextColor={global.info}
              />
        </View>

        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, paddingLeft:20, borderWidth:0.5, borderColor:pinError?'red':'white'}}>
              <FontAwesome5 name={'map-pin'} light style={{fontSize:14, color:global.text}}/>
              <TextInput
                style={{width:'85%', height:50, paddingLeft:10, color:global.text}}
                onChangeText={(text)=>{setPin(text)}}
                value={pin}
                maxLength={6}
                placeholder="Pin"
                keyboardType="numeric"
                placeholderTextColor={global.info}
              />
        </View>


        <View style={{marginTop:50, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, paddingLeft:20, borderWidth:0.5, borderColor:phoneError?'red':'white'}}>
              <FontAwesome5 name={'mobile-android'} light style={{fontSize:14, color:global.text}}/>
              <Text style={{color:global.info, paddingLeft:10}}>+91 |</Text>
              <TextInput
                style={{width:'85%', height:50, paddingLeft:10, color:global.info}}
                onChangeText={(text)=>{setPhone(text)}}
                value={phone}
                maxLength={10}
                placeholder="Mobile Number"
                keyboardType="numeric"
                editable={false}
                placeholderTextColor={global.info}
              />
        </View>


        <View style={{marginTop:50, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, paddingLeft:20, borderWidth:0.5, borderColor:emailError?'red':'white'}}>
              <FontAwesome5 name={'envelope-open-text'} light style={{fontSize:14, color:global.text}}/>
              <TextInput
                style={{width:'85%', height:50, paddingLeft:15, color:global.text}}
                onChangeText={(text)=>{setEmail(text)}}
                value={email}
                placeholder="Email"
                placeholderTextColor={global.info}
              />
        </View>


        <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', paddingLeft:10}}>
              <FontAwesome5 name={'id-card-alt'} light style={{fontSize:14, color:global.text}}/>
              <Picker
                selectedValue={selectedID}
                style={{ height: 50, width: '90%', color:global.text }}
                onValueChange={(itemValue, itemIndex) => setSelectedID(itemValue)}
              >
                <Picker.Item label="Aadhaar Card" value="Aadhaar Card" />
                <Picker.Item label="Driving Licence" value="Driving Licence" />
                <Picker.Item label="Voter Id" value="Voter Id" />
                <Picker.Item label="Passport" value="Passport" />
              </Picker>
        </View>


        <View style={{flexDirection:'row', alignItems:'center', marginTop:20}}>
          
            {proofFileAvailable?
             <View style={{alignItems:'center', backgroundColor:'white', borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:global.info}} onPress={()=>{onOpenAddImage()}}>
               <Image
                  style={{height:80,width:80, borderRadius:5}}
                  source={{uri:proofPath}}
                />
                <TouchableOpacity style={{position:'absolute',top:-10,right:-10, height:30, width:30, backgroundColor:global.text, justifyContent:'center', alignItems:'center', borderRadius:20}} onPress={()=>{deleteProof()}}>
                  <FontAwesome5 name={'trash-alt'} solid style={{fontSize:15, color:'white'}}/>
                </TouchableOpacity>
              </View>
              :

              <TouchableOpacity style={{alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:fileError?'red':global.info}} onPress={()=>{onOpenAddImage()}}>
                <Text style={{fontSize:11, color:global.text}}>+ ADD FILE</Text>
              </TouchableOpacity>
            
            }
        </View>

      </ScrollView>


      {orderIsInProcess?
      <View style={{width:'100%', backgroundColor:global.background, position:'absolute', bottom:0, height:60, justifyContent:'center', alignItems:"center"}} >
        <View style={{width:'90%', backgroundColor:global.background, height:50, justifyContent:'center', alignItems:"center"}}>
          <Text style={{color:global.primary, fontSize:18, fontWeight:'bold'}}>PLACING ORDER ....</Text>
        </View>
      </View>
      :
      <TouchableOpacity style={{width:'100%', backgroundColor:global.background, position:'absolute', bottom:0, height:60, justifyContent:'center', alignItems:"center"}}  onPress={()=>{validateForm()}}>
        <View style={{width:'90%', backgroundColor:global.primary, height:50, justifyContent:'center', alignItems:"center", borderRadius:5}}>
          <Text style={{color:global.white, fontSize:18, fontWeight:'bold'}}>BUY</Text>
        </View>
      </TouchableOpacity>
      }

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          display="spinner"
          maximumDate={new Date()}
          onChange={onChange}
        />
      )}


      {orderCompleted?
      <View style={{flex:1, backgroundColor:'black', position:'absolute', width:'100%', height:'100%', top:0, opacity:0.9}}>
      </View>
      :null
      }


      {orderCompleted?
      <View style={{flex:1, position:'absolute', width:'100%', height:'100%', top:0, justifyContent:'center', alignItems:'center'}}>
        <Text style={{color:global.white, fontSize:25}}>Thank you for your order</Text>
        <FontAwesome5 name={'check-circle'} solid style={{fontSize:60, color:global.white, marginTop:50}}/>
        <Text style={{color:global.white, fontSize:14, marginTop:20}}>Your order has been placed successfully</Text>

        <Text style={{color:global.white, fontSize:14, marginTop:50}}>Your policy number is</Text>
        <Text style={{color:global.white, fontSize:18, marginTop:5}}>{policyNumber}</Text>



        <TouchableOpacity style={{width:100, height:40, borderRadius:5, justifyContent:'center', alignItems:'center', borderColor:global.white, borderWidth:1, marginTop:70}} onPress={()=>{Actions.dashboard()}}>
          <Text style={{color:global.white}}>CLOSE</Text>
        </TouchableOpacity>

      </View>
      :null
      }


      <Modalize 
        ref={addImagePopup}
        modalHeight={250}
        >
        
        <View style={{justifyContent:'center'}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', height:50, alignItems:'center', marginTop:10, borderBottomWidth:1, borderColor:global.border, paddingBottom:10}}>

            
              <View style={{paddingLeft:20, flexDirection:'row'}}>
                
                <View style={{paddingLeft:0}}>
                   <Text style={{fontWeight:"bold", fontSize:16, color:global.primary}}>ADD IMAGE</Text>
                </View>           
                  
              </View>
              
              <TouchableOpacity style={{paddingRight:20, height:'100%', justifyContent:'center', paddingLeft:20}}  onPress={()=>{onCloseAddImage()}}>
                 <FontAwesome5 name={'times'} light style={{fontSize:25, color:global.black}}/>
              </TouchableOpacity>
            </View>
        </View>

        <View style={{marginTop:10}}>
          <TouchableOpacity style={{height:50, width:'90%', marginLeft:'5%', alignItems:'center', borderWidth:1, borderColor:global.info, flexDirection:'row', marginTop:10, borderRadius:5}} onPress={()=>{selectImage()}}>
            <FontAwesome5 name={'photo-video'} light style={{fontSize:30, color:global.text, marginLeft:10}}/>
            <Text style={{color:global.text, marginLeft:10}}>Select image from gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{height:50, width:'90%', marginLeft:'5%', alignItems:'center', borderWidth:1, borderColor:global.info, flexDirection:'row', marginTop:20, borderRadius:5}} onPress={()=>{checkCameraPermission() }}>
            <FontAwesome5 name={'camera'} light style={{fontSize:30, color:global.text, marginLeft:10}}/>
            <Text style={{color:global.text, marginLeft:10}}>Select image from camera</Text>
          </TouchableOpacity>
        </View>


      </Modalize>
       
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

export default BuyPlan;
