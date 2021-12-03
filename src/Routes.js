/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React,{useState, useEffect} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  BackHandler,
  Alert
} from 'react-native';

import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';
import NetInfo from "@react-native-community/netinfo";

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Otp from './pages/Otp';
import BuyPlan from './pages/BuyPlan';
import Profile from './pages/Profile';
import QrCodeReader from './pages/QrCodeReader';
import AddClaim from './pages/AddClaim';
import ClaimSuccess from './pages/ClaimSuccess';
import BecomePartner from './pages/BecomePartner';
import CenterRequested from './pages/CenterRequested';
import EditPartner from './pages/EditPartner';



import auth from '@react-native-firebase/auth';
var currentUser = auth().currentUser;

import firestore from '@react-native-firebase/firestore';
const db = firestore()

const Routes = () => {

  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("user");

  useEffect(()=>{
    checkUserLoggedIn();
    getPlans();
    console.log('>>>>>>>>useEffect routes>>>>>>>>>>>>>>>')
     BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      console.log('Removing back handler++++++++++++++++++++++++++++++++++++')
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };


    
  },[loggedIn])

  const  handleBackButtonClick=()=> {
    console.log('Action.currentScene>>>>>routes>>>>>>>>>>>>>'+Actions.currentScene)
    if (Actions.currentScene == 'dashboard') {
      createTwoButtonAlert()
    }else if (Actions.currentScene == 'profile'){
      Actions.dashboard();
    }else{
      return true;
    }
  }

  const createTwoButtonAlert = () =>{
    console.log('___________________________________')
    Alert.alert(
      "",
      "Are you sure want to exit app ?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel"),
          style: "cancel"
        },
        { text: "OK", onPress: () => BackHandler.exitApp() }
      ]
    );
  }


   const getPlans=()=>{
    db.collection("plans").get()
    .then((querySnapshot) => {

      var tempArray = []
      querySnapshot.forEach((doc) => {

           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })
      global.plans = tempArray;

    })
  }


  const checkUserLoggedIn=()=>{
    if(currentUser == null){
      console.log('user data null>>>>>>>>>>>>'+currentUser)
    }else{
      checkRoleAndUpdate();
      console.log('user data not null >>>>>>>>>>>>'+JSON.stringify(currentUser))
      global.userData = currentUser;
      global.isUserLoggedIn = true;
      setLoggedIn(true)
    }
  }


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

  return(
  <Router>
    <Stack key="root"  hideNavBar={true}>
      <Scene key="dashboard" component={Dashboard} title="Dashboard" initial={true} role={role}/>
      <Scene key="login" component={Login} title="Login"/>
      <Scene key="otp" component={Otp} title="Otp"/>
      <Scene key="buyplan" component={BuyPlan} title="BuyPlan"/>
      <Scene key="profile" component={Profile} title="Profile"/>
      <Scene key="qrcodereader" component={QrCodeReader} title="QrCodeReader"/>
      <Scene key="addclaim" component={AddClaim} title="AddClaim" />
      <Scene key="claimsuccess" component={ClaimSuccess} title="ClaimSuccess" />
      <Scene key="becomepartner" component={BecomePartner} title="BecomePartner" />
      <Scene key="centerrequested" component={CenterRequested} title="CenterRequested" />
      <Scene key="editpartner" component={EditPartner} title="EditPartner" />
    </Stack>
  </Router>
  )
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

export default Routes;
