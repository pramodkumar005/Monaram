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
  FlatList
} from 'react-native';


import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';
import Plans from '../components/Plans';
import MyPlans from '../components/MyPlans';
import Info from '../components/Info';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const db = firestore()
var currentUser = auth().currentUser;


const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


const Landing = ({infoPopUp, planPopup, myPlanPopup, userRole}) => {
  const [home, setHome] = useState(true);
  const [center, setCenter] = useState(false);
  const [user, setUser] = useState(false);
  const [support, setSupport] = useState(false);
  const [isMyPlanPresent, setIsMyPlanPresent] =  useState(true);
  const [role, setRole] = useState(userRole);

  console.log('landing>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+JSON.stringify(global.userData))
  console.log('landing isuserloggedins>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+global.isUserLoggedIn)
  console.log('global.isUserLoggedIn landing>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+JSON.stringify(currentUser))
  console.log('role>>>>>>>>>>Landing>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+userRole)
  console.log('role>>>>>>>>>>Landing>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+role)
  
  useEffect(()=>{
    currentUser = auth().currentUser;
    checkUserLoggedIn();
    // if(currentUser == null){
    //   global.userData = {}
    //   global.isUserLoggedIn = false;
    // }else{
    //   global.userData = currentUser
    //   global.isUserLoggedIn = true;
    // }
    
  },[])

  const checkRoleAndUpdate=()=>{
   db.collection("profile").doc(auth().currentUser.uid).get()
    .then((response) => {
      setRole(response.data().role)
     console.log('Routes++++++++++>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+JSON.stringify(response.data().role))
      global.role = response.data().role;
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
       
    });
  }

  const checkUserLoggedIn=()=>{
    if(currentUser == null){
      console.log('user data null>>>>>>>>>>>>'+currentUser)
    }else{
      checkRoleAndUpdate();
      console.log('user data not null >>>>>>>>>>>>'+JSON.stringify(currentUser))
      global.userData = currentUser;
      global.isUserLoggedIn = true;
      // setLoggedIn(true)
    }
  }


  const elementInfoPressed=(e)=>{
    console.log("Hello>>>>>>>>>>>>>>>>>>>"+e);
    infoPopUp(e);
  }

  const elementPlanPressed=(e)=>{
    console.log("plan>>>>>>>>>>>>>>>>>>>"+e);
    planPopup(e);
  }


  const elementMyPlanPressed=(e)=>{
    console.log("My plan>>>>>>>>>>>>>>>>>>>"+e);
    myPlanPopup(e);
  }

  const plansPresent=(e)=>{
    console.log("plans present>>>>>>>>>>>>>>>>>>>"+e);
    setIsMyPlanPresent(e)
  }

  
  return (
    <ScrollView  contentContainerStyle={{flexGrow:1, backgroundColor:global.background, paddingBottom:50}}>
      <View style={{flexDirection:'row', justifyContent:'space-between', paddingLeft:10, paddingRight:10, height:50, alignItems:'center', marginTop:10}}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image
              style={{height:18,width:18}}
              source={require('../assets/logo.png')}
            />
            <Text style={{fontSize:18, fontWeight:'bold', paddingLeft:5, color:global.primary}}>Monaram</Text>
          </View>

          {global.isUserLoggedIn?
            <View style={{flexDirection:'row', alignItems:'center'}}>
              {role =='partner'?
                <TouchableOpacity style={{marginRight:25, paddingLeft:25, paddingRight:10}} onPress={()=>{Actions.qrcodereader()}}>
                  <FontAwesome5 name={'qrcode'} light style={{fontSize:30, color:global.text}}/>
                </TouchableOpacity>
                :null
              }
              <View style={{flexDirection:'row', alignItems:'center'}}>
                
                {global.userData.photoURL == null?
                  <TouchableOpacity style={{flexDirection:'row', alignItems:'center', backgroundColor:global.white, borderRadius:10}} onPress={()=>{Actions.profile({userRole:role})}}>
                    <Image
                      style={{height:40,width:40, borderWidth:5, borderColor:global.white, borderRadius:10}}
                      source={require('../assets/user.png')}
                    />
                  </TouchableOpacity>
                :
                  <TouchableOpacity style={{flexDirection:'row', alignItems:'center', backgroundColor:global.white, borderRadius:10}} onPress={()=>{Actions.profile({userRole:role})}}>
                    <Image
                      style={{height:40,width:40, borderWidth:5, borderColor:global.white, borderRadius:10}}
                      source={{uri:global.userData.photoURL}}
                    />
                  </TouchableOpacity>
                }
              </View>
            </View>
            :
            <TouchableOpacity style={{flexDirection:'row', alignItems:'center', padding:10}} onPress={()=>{Actions.login({lastPage: 'dashboard'})}}>
              <FontAwesome5 name={'user'} light style={{fontSize:12, marginRight:5, color:global.black}}/>
              <Text style={{color:global.black, fontSize:12}}>LOGIN</Text>
            </TouchableOpacity>
          }

      </View>

      {global.isUserLoggedIn?
        <View style={{height:isMyPlanPresent?180:0, marginTop:0}}>
            {isMyPlanPresent?
              <MyPlans elementMyPlanPressed={elementMyPlanPressed}  plansPresent={plansPresent} userRole={role}/>
              :null
            }
        </View>
        :null
        }

      <View style={{height:160, marginTop:10}}>
        <Plans elementPlanPressed={elementPlanPressed} userRole={role}/>
      </View>

      <View style={{flex:1, marginTop:40}}>
        <Info elementInfoPressed={elementInfoPressed}/>
      </View>

    </ScrollView>
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

export default Landing;
