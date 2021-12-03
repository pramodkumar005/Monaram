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
  FlatList,
  TextInput
} from 'react-native';


import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';
import Carousel from 'react-native-snap-carousel';
import moment from 'moment';
import RNQRGenerator from 'rn-qr-generator';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';
import { Modalize } from 'react-native-modalize';
import * as Helper from '../common/Helper';

import ImageResizer from 'react-native-image-resizer';

import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const db = firestore()
var currentUser = auth().currentUser;



const Profile = ({userRole}) => {
const [name, setName] = useState(global.userData.displayName)
const [nameEdit, setNameEdit] = useState(false)
const [profilePath, setProfilePath] = useState("");
const [profileImagePath, setProfileImagePath] = useState(global.userData.photoURL);
const [isPhotoUpdated, setIsPhotoUpdated] = useState(false);

const [centerDetails, setCenterDetails] = useState({});

const [role, setRole] = useState(userRole);



  console.log('global.userData.global.userData.global.userData.global.userData.global.userData.global.userData.'+JSON.stringify(userRole))

  const profilePopupContent = useRef<Modalize>(null);

  useEffect(()=>{
   currentUser = auth().currentUser;

   if(role == 'partner'){
    getCenterDetails()
   }
    
  },[isPhotoUpdated])

  const logOut =()=>{
     auth().signOut()
    .then(() => {
      global.isUserLoggedIn = false;
      global.userData = {};
      global.myPlan = [];
      Actions.dashboard();
    })
    .catch(e=>{
     console.error('Sign Out Error', e);
    });
  }


  const phoneNumber=(phone)=>{
    var tempArray = []
    for (var i = 0; i <phone.length; i++) {
      var eachElement = <Text style={{color:global.black, fontSize:11}}>{phone[i]} </Text>
      tempArray.push(eachElement);
    }

    return tempArray;
  }



  const getCenterDetails=()=>{
    
    db.collection("partners")
    .where("createdBy","==", currentUser.uid)
    .get()
    .then((querySnapshot) => {

      var tempArray = []
      querySnapshot.forEach((doc) => {
           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })
      console.log(JSON.stringify(tempArray[0]))
      setCenterDetails(tempArray[0])

    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        Helper.showFlashMessage("Fail to update name", global.alert);
    });
  }


  const updateUserName = () =>{
     const currentUser = auth().currentUser;
        
      currentUser.updateProfile({
        displayName: name
      })
      .then(()=>{
        console.log('User is logged in:::')
        updateUsersProfile()
      })
      .catch(error => {
          console.log(error.message)
        })
  }


  const updateUsersProfile=(userData)=>{
    console.log(auth().currentUser.uid)
    db.collection("profile").doc(auth().currentUser.uid).set({name: auth().currentUser.displayName},{merge:true})
    .then((response) => {
      global.userData = auth().currentUser;
      setNameEdit(false);
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        Helper.showFlashMessage("Fail to update name", global.alert);
    });
  }


  const selectImage=()=>{
    launchImageLibrary({selectionLimit:1}, (e)=>{
      console.log(JSON.stringify(e))
      if(e.hasOwnProperty("didCancel") == true){
        Helper.showFlashMessage("No image selected", global.alert);
      }else{
        ImageResizer.createResizedImage(e.assets[0].uri, global.imageHeight, global.imageWidth, 'JPEG', global.quality, 0)
          .then(response => {
            setProfilePath(response.uri,[uploadPhoto(response.uri)]);
            console.log('mmmmmmmmmmmmmmmmmmm>>>>'+JSON.stringify(response))
            // response.uri is the URI of the new image that can now be displayed, uploaded...
            // response.path is the path of the new image
            // response.name is the name of the new image with the extension
            // response.size is the size of the new image

          })
          .catch(err => {
            console.log(err)
            // Oops, something went wrong. Check that the filename is correct and
            // inspect err to get more details.
          });
        // setProfilePath(e.assets[0].uri,[uploadPhoto(e.assets[0].uri)]); 
      }
       
    })
  }



  const uploadPhoto =(path)=>{
    storage().ref('profile/'+auth().currentUser.uid+'.jpg').putFile(path)
    .then((response) => {
      console.log("profile photo uploaded>>>>>>>>>>>>>");
      updateUsersProfilePhoto();
    })
    .catch((error) => {
        console.error("Error upload document: ", error);
        Helper.showFlashMessage("Fail to update profile image", global.alert);
    });    
  }


  const getProofDownloadUrl = async(id)=>{
    console.log("getting download url for "+id);
    var downloadUrl = await storage().ref('profile/'+auth().currentUser.uid+'.jpg').getDownloadURL();
    console.log(downloadUrl);
    return downloadUrl;
  }


  


  const updateUsersProfilePhoto= async (userData)=>{
    
    var url = await getProofDownloadUrl();

    currentUser.updateProfile({photoURL: url})

    db.collection("profile").doc(auth().currentUser.uid).set({photo: url},{merge:true})
    .then((response) => {
      global.userData = auth().currentUser;

      console.log('Profile photo uploaded>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')

      global.userData = currentUser
      
      Helper.showFlashMessage("Profile image updated", global.success);
      setProfileImagePath(url)
      setIsPhotoUpdated(true)



    })
    .catch((error) => {
        Helper.showFlashMessage("Fail to update profile image", global.alert);
        console.error("Error writing document: ", error);
    });
  }
   
  
  return (
    <View style={{flex:1, backgroundColor:global.background}}>
        <View style={{flexDirection:'row', justifyContent:'space-between', paddingLeft:10, paddingRight:10, height:50, alignItems:'center', marginTop:10}}>
          
          <TouchableOpacity style={{flexDirection:'row', alignItems:'center', paddingLeft:10, height:50}} onPress={()=>{ if(setIsPhotoUpdated){Actions.dashboard()}else{Actions.pop()}}}>
          
            <FontAwesome5 name={'long-arrow-alt-left'} light style={{fontSize:30, color:global.text}}/>
          </TouchableOpacity>


          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image
              style={{height:18,width:18}}
              source={require('../assets/logoGrey.png')}
            />
            <Text style={{fontSize:18, fontWeight:'bold', paddingLeft:5, color:global.info}}>MonAram</Text>

          </View>
      </View>
        <ScrollView contentContainerStyle={{marginLeft:20, marginRight:20}}>
                <View style={{marginTop:10, borderWidth:5, borderRadius:5, width:100, borderColor:global.white}}>
                  {profileImagePath == null?
                    <Image
                      style={{height:90,width:90, borderRadius:5, backgroundColor:global.white}}
                      source={require('../assets/logoGrey.png')}
                    />
                    :
                    <Image
                      style={{height:90,width:90, borderRadius:5, backgroundColor:global.white}}
                      source={{uri:profileImagePath}}
                    />
                  }
                  
                  <TouchableOpacity style={{height:30, width:30, backgroundColor:global.primary, borderRadius:30, justifyContent:'center', alignItems:'center', position:'absolute', bottom:0, right:-10}} onPress={()=>{selectImage()}}>
                    <FontAwesome5 name={'camera'} solid style={{fontSize:15, color:global.white}}/>
                  </TouchableOpacity>
                </View>
                
                {nameEdit==false?
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start',  marginTop:40}}>
                    <View style={{alignItems:'flex-start', flexDirection:'row'}}>
                      <FontAwesome5 name={'user'} light style={{fontSize:15, color:global.primary}}/>
                      <View style={{marginLeft:10}}>
                        {global.userData.displayName == null?
                          <Text style={{fontSize:14, color:global.info }}>(No name added yet)</Text>
                          :
                          <Text style={{fontSize:14, color:global.black}}>{global.userData.displayName}</Text>
                        }
                        
                        <Text  style={{fontSize:14, color:global.info, marginTop:5}}>{global.userData.phoneNumber}</Text>
                      </View>
                    </View>

                    
                      <TouchableOpacity style={{width:40, height:25, justifyContent:'center', alignItems:'center', borderWidth:1, borderRadius:5,borderColor:global.info}} onPress={()=>{setNameEdit(true)}}>
                          <Text style={{color:global.black, fontSize:11}}>EDIT</Text>
                      </TouchableOpacity>
                    
                </View>
                :
                <View style={{flexDirection:'row', alignItems:'center', marginTop:20}}>
                  <View style={{width:'90%', flexDirection:'row', backgroundColor:global.white, borderRadius:5, justifyContent:'space-between', alignItems:'center', paddingLeft:5, paddingRight:5}}>
                        <TextInput
                            style={{width:'70%', height:50, paddingLeft:10, color:'#000000', borderRadius:5, padding:5, borderColor:global.border}}
                            onChangeText={(text)=>{setName(text)}}
                            value={name}
                            maxLength={25}
                            placeholder="Full name"
                          />
                        <TouchableOpacity style={{justifyContent:'center', alignItems:'center', backgroundColor:global.primary, width:60,height:40}} onPress={()=>{updateUserName()}}> 
                          <Text style={{color:global.white}}>SAVE</Text>
                        </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={{height:50, width:30, marginLeft:10, justifyContent:'center', alignItems:'center'}} onPress={()=>{setNameEdit(false)}}>
                    <FontAwesome5 name={'times'} solid style={{fontSize:15, color:global.black}}/>
                  </TouchableOpacity>
                </View>
                }
      
                <TouchableOpacity style={{width:80, height:35, justifyContent:'center', alignItems:'center', borderWidth:1, borderRadius:5,borderColor:global.primary, marginTop:40}} onPress={()=>{logOut()}}>
                  <Text style={{color:global.primary}}>LOG OUT</Text>
                </TouchableOpacity>

                {role == 'partner'?
                <View style={{borderTopWidth:1, marginTop:20, borderColor:global.white}}>
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop:20}}>
                      <Text style={{fontSize:14, color:global.info}}>CLINIC / HOSPITAL DETAIL</Text>

                        {/*<TouchableOpacity style={{width:40, height:25, justifyContent:'center', alignItems:'center', borderWidth:1, borderRadius:5,borderColor:global.info}} onPress={()=>{}}>
                                                    <Text style={{color:global.black, fontSize:11}}>EDIT</Text>
                                                </TouchableOpacity>*/}
                    </View>

                   <View style={{width:'100%', height:150, backgroundColor:global.white,  marginBottom:20, borderRadius:10, padding:10, flexDirection:'row', justifyContent:'space-between', marginTop:15}}>
          
                      <View>
                        <Text style={{color:global.black, fontSize:12, color:global.primary}}>{centerDetails.name}</Text>

                        <Text style={{color:global.black, fontSize:11, marginTop:10}}>{centerDetails.address}</Text>
                        <Text style={{color:global.black, fontSize:11}}>{centerDetails.addressCont}</Text>
                       
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                          <Text style={{color:global.black, fontSize:11}}>{centerDetails.city}</Text>
                          <Text style={{color:global.black, fontSize:11}}>{centerDetails.state}</Text>
                        </View>
                        <Text style={{color:global.black, fontSize:11}}>{centerDetails.pin}</Text>

                          <View style={{height:25, width:60, justifyContent:'center', alignItems:'center', borderWidth:1, borderRadius:25, marginTop:10, borderColor:centerDetails.status == 'success'?global.success:global.primary}}>
                            <Text style={{fontSize:12, color:centerDetails.status == 'success'?global.success:global.primary}}>{centerDetails.status}</Text>
                          </View>
                        

                      </View>

                      <View style={{alignItems:'flex-end'}}>
                        <Text style={{color:global.black, fontSize:11, marginBottom:10}}>{centerDetails.email}</Text>
                        {centerDetails.hasOwnProperty("phone")?
                          phoneNumber(centerDetails.phone)
                          :null
                        }
                        
                      </View>
                    </View>

                    {centerDetails.status == 'rejected'?
                    <View style={{marginTop:10}}>
                      <Text style={{fontSize:12, color:global.alert}}>Your request has been rejected. Please contact the customer care.</Text>
                    </View>
                    :
                    <View style={{marginTop:10}}>
                      <Text style={{fontSize:12, color:global.text}}>To update or change your clinic details  please contact the customer care.</Text>
                    </View>
                    }

                </View>
                :null
                }
      
            </ScrollView>

       
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

export default Profile;
