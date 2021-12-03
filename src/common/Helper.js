global.isUserLoggedIn = false;
global.userData = {};
global.plans = [];
global.infos = [];
global.myPlan = [];
global.partnerList = [];
global.role = 'user';
global.requestedPartnerList = [];
global.pagination = 5;
global.firebaseMessagingKey = 'AAAAJUISUyY:APA91bFQ7PLt60E9muJWiWyt9znHFP7vwY7QuGU1IKKyADU2Ot4zl1nprY0xARiphYQrOsoZRMUTgRBAGeQzFLdLiSyF7La6qXF6b1isx6PkSjTA0TSUP691CZZPNgN6l56uaSN7MWNo';


//image resize
global.quality = 50;
global.imageHeight = 800;
global.imageWidth = 800;



import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
const db = firestore();

//razorpay  test key
// global.razorKey = 'rzp_test_LatMqDewWhB3j3'; //promo test account
global.razorKey = 'rzp_test_g5RZWOuzejqeXf'; //pur test account


import { showMessage, hideMessage } from "react-native-flash-message";
import "./Theme.js";

export const  showFlashMessage=(msg, clr)=>{
    showMessage({
      message: msg,
      type: "info",
      icon:{ icon: "danger", position: "right"},
      style:{backgroundColor:clr, borderWidth:0},
      titleStyle:{color:global.white},

    });
  }


//----------------send notifications to admins for claims------------------
export async  function getNotificationToAdminList(status, claimID){
  
    var tempArray = []
    db.collection("profile")
    .where('role','==','admin').get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
           console.log(' supervisor++++==============> ', doc.data().fcmToken);
           var eachElement =  doc.data().fcmToken
           tempArray.push(eachElement)
        })
      sendNotificationsToAdmin(tempArray, status, claimID)
    })
    .catch((error) => {
        console.error("Error writing document getSupervisorsAndAdminLists: ", error);
        
    }); 
    
  }


export async  function sendNotificationsToAdmin(arrays, status, claimID){
    
    var adminList = arrays;
    const FIREBASE_API_KEY = global.firebaseMessagingKey
      const message = {
        registration_ids: adminList,
        notification: {
          title: "Claim "+status,
          body: "Claim - "+claimID+" has been "+status,
          vibrate: 1,
          sound: 1,
          show_in_foreground: true,
          priority: "high",
          content_available: true,
        },
        data: {
          title: "Claim "+status,
          body: "Claim - "+claimID+" has been "+status
        },
      }

      let headers = new Headers({
        "Content-Type": "application/json",
        Authorization: "key=" + FIREBASE_API_KEY,
      })

      let response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers,
        body: JSON.stringify(message),
      })
      response = await response.json()
      console.log('message sent >>>>>>>>>>>>>>>>>')

  }

//----------------send notifications to admins for claims ends------------------



//----------------send notifications to user for claims------------------

  export async  function getNotificationToUser(uid, status, claimID){
  console.log('----------------------------------------------------------------------------------------')
      var tempArray = []
      
     // query = db.collection("profile").where("role","==","admin");

    db.collection("profile").doc(uid)
    .get()
    .then((response) => {
      
     console.log('vvvvvvvvvvvvvvvvv.................'+JSON.stringify(response.data().fcmToken))
      tempArray.push(response.data().fcmToken)
      sendNotificationsToUser(tempArray, status, claimID)
    })
    .catch((error) => {
        console.error("Error writing document getSupervisorsAndAdminLists: ", error);
        
    }); 
    
  }



export async  function sendNotificationsToUser(arrays, status, claimID){
    
    var adminList = arrays;

    const FIREBASE_API_KEY = global.firebaseMessagingKey
      const message = {
        registration_ids: adminList,
        notification: {
          title: "Claim "+status,
          body: "Claim - "+claimID+" has been "+status,
          vibrate: 1,
          sound: 1,
          show_in_foreground: true,
          priority: "high",
          content_available: true,
        },
        data: {
          title: "Claim "+status,
          body: "Claim - "+claimID+" has been "+status
        },
      }

      let headers = new Headers({
        "Content-Type": "application/json",
        Authorization: "key=" + FIREBASE_API_KEY,
      })

      let response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers,
        body: JSON.stringify(message),
      })
      response = await response.json()
      console.log('----------------------------notification sent to user>>>>>>>>>>>>>>>>>----------------------')

  }

//----------------send notifications to users for claims ends------------------







//----------------send notifications to admins for center users------------------
export async  function getNotificationToAdminListForCenter(name){
  
    var tempArray = []
    db.collection("profile")
    .where('role','==','admin').get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
           console.log(' supervisor++++==============> ', doc.data().fcmToken);
           var eachElement =  doc.data().fcmToken
           tempArray.push(eachElement)
        })
      sendNotificationsToAdminForCenter(name)
    })
    .catch((error) => {
        console.error("Error writing document getSupervisorsAndAdminLists: ", error);
        
    }); 
    
  }


export async  function sendNotificationsToAdminForCenter(name){
    
    var adminList = arrays;
    const FIREBASE_API_KEY = global.firebaseMessagingKey
      const message = {
        registration_ids: adminList,
        notification: {
          title:"Become partner request recieved",
          body: name + " has Request to become partner.",
          vibrate: 1,
          sound: 1,
          show_in_foreground: true,
          priority: "high",
          content_available: true,
        },
        data: {
          title:"Become partner request recieved",
          body: name + " has Request to become partner.",
        },
      }

      let headers = new Headers({
        "Content-Type": "application/json",
        Authorization: "key=" + FIREBASE_API_KEY,
      })

      let response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers,
        body: JSON.stringify(message),
      })
      response = await response.json()
      console.log('message sent >>>>>>>>>>>>>>>>>')

  }

//----------------send notifications to admins for center ends------------------




//----------------send notifications to users for center ------------------

  export async  function getNotificationToUserForCenter(uid, status){
  console.log('----------------------------------------------------------------------------------------')
      var tempArray = []
      
     // query = db.collection("profile").where("role","==","admin");

    db.collection("profile").doc(uid)
    .get()
    .then((response) => {
      
     console.log('vvvvvvvvvvvvvvvvv.................'+JSON.stringify(response.data().fcmToken))
      tempArray.push(response.data().fcmToken)
      sendNotificationsToUserForCenter(status, tempArray)
    })
    .catch((error) => {
        console.error("Error writing document getSupervisorsAndAdminLists: ", error);
        
    }); 
    
  }



export async  function sendNotificationsToUserForCenter(status, arrays){
    
    var userList = arrays;

    const FIREBASE_API_KEY = global.firebaseMessagingKey
      const message = {
        registration_ids: userList,
        notification: {
          title: "Become partner request",
          body: "Your request to become partner has been "+status,
          vibrate: 1,
          sound: 1,
          show_in_foreground: true,
          priority: "high",
          content_available: true,
        },
        data: {
          title: "Become partner request",
          body: "Your request to become partner has been "+status,
        },
      }

      let headers = new Headers({
        "Content-Type": "application/json",
        Authorization: "key=" + FIREBASE_API_KEY,
      })

      let response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers,
        body: JSON.stringify(message),
      })
      response = await response.json()
      console.log('----------------------------notification sent to user>>>>>>>>>>>>>>>>>----------------------')

  }

//----------------send notifications to users for center ends------------------





//----------------update policy to FB------------------------

export const updatePolicyToFB=(data, policyID)=>{

      // var index = planData.plan.benefitAmount.findIndex(x=>x.name.toLowerCase() === selectedClaim.selectedInsuranceType.name.toLowerCase())

      // var tempPlanData = planData;
      
      // tempPlanData.plan.benefitAmount[index].initiatedAmount = Number(planData.plan.benefitAmount[index].initiatedAmount) + Number(claimAmount);
      


    db.collection("orders").doc(policyID).set(data, {merge:true})
    .then((response) => {

      console.log("policy data updated to FB >>>>>>>>>>>>>");
      
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        setLoader(false)
        
    });
  }