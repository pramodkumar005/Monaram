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
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  PermissionsAndroid,
  Picker,
  Alert 
} from 'react-native';


import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';
import Plans from '../components/Plans';
import Info from '../components/Info';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';
import SegmentedControlTab from "react-native-segmented-control-tab";
import moment from 'moment';
import { Modalize } from 'react-native-modalize';
import { FlatGrid } from 'react-native-super-grid';
import * as Helper from '../common/Helper';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import CityList from '../common/CityList.json'

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import ImageResizer from 'react-native-image-resizer';

const db = firestore()
var currentUser = auth().currentUser;

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


const Claims = ({myselectedImage, userRole}) => {
  const [index, setIndex] = useState(0);
  const [submittedClaimList, setSubmittedClaimList] = useState([]);
  const [approvedClaimList, setApprovedClaimList] = useState([]);
  const [initiatedClaimList, setInitiatedClaimList] = useState([]);
  const [settledClaimList, setSettledClaimList] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState({});
  const [modalVisible,setModalVisible] = useState(false)
  const [claimAmount, setClaimAmount] = useState(0);
  const [updatedClaimAmount, setUpdatedClaimAmount] = useState(0);
  const [billPhoto, setBillPhoto] = useState("");
  const [acceptClaimModal,setAcceptClaimModal] = useState(false)
  const [transactionClaimModal, setTransactionClaimModal] = useState(false) 
  const [settledClaimRefrence, setSettledClaimRefrence] = useState("") 
  const [settledClaimMode, setSettledClaimMode] = useState("google")

  const [lastVisibleInitiatedClaims,setLastVisibleInitiatedClaims] = useState();
  const [initiatedClaimsPagination,setInitiatedClaimsPagination] = useState(true);

  const [lastVisibleSubmittedClaims,setLastVisibleSubmittedClaims] = useState();
  const [submittedClaimsPagination,setSubmittedClaimsPagination] = useState(true);

  const [lastVisibleApprovedClaims,setLastVisibleApprovedClaims] = useState();
  const [approvedClaimsPagination,setApprovedClaimsPagination] = useState(true);

  const [lastVisibleSettledClaims,setLastVisibleSettledClaims] = useState();
  const [settledClaimsPagination,setSettledClaimsPagination] = useState(true);

  const [planData, setPlanData] = useState({})
  const [initiatedLabel, setInitiatedLabel] = useState(false);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const [loader,setLoader] = useState(false)

  const [role, setRole] = useState(userRole);

  const [partnerData, setPartnerData] = useState({});

  const claimPopupContent = useRef<Modalize>(null);

  const [filterModal, setFilterModal] = useState(false);
  const stateList = Object.keys(CityList);
  const cityList = CityList.Nagaland;
  const [partnerListOfFilter, setPartnerListOfFilter] = useState([]);
  const [selectedState, setSelectedState] = useState("Nagaland");
  const [selectedCity, setSelectedCity] = useState("Dimapur");
  const [selectedPartner, setSelectedPartner] = useState({});
  const [filterApplied, setFilterApplied] = useState(false);
  const [partnerListLoading, setPartnerListLoading] = useState(false);


  // console.log(' in cityList>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+JSON.stringify(cityList))

  useEffect(()=>{
    // checkCameraPermission();

    getSubmittedClaims();
    getApprovedClaims();
    getInitiatedClaims();
    getSettledClaims();
    
  },[filterApplied])


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
            selectBillPhoto()
          } else {
            setModalVisible(false)
            console.log('Camera permission denied');
            Helper.showFlashMessage("Camera action denied. Go to settings > apps and enable camera ", global.alert);

          }
      }else{
        selectBillPhoto()
      }

    })
  }


  const getPartnerListOfFilter=(city)=>{
    console.log('fetching for city()________________________________________'+JSON.stringify(city))
    setPartnerListLoading(true)
    db.collection("partners")
    .where('state', '==', selectedState)
    .where('city', '==', city)
    .where('status', '==', "active")
    .get()
    .then((querySnapshot) => {

      var tempArray = []
      querySnapshot.forEach((doc) => {

           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })
        console.log('doc.data()>>>>>>>>>>>>>'+JSON.stringify(tempArray.length))
        if(tempArray.length>0){
          setSelectedPartner(tempArray[0])
          setPartnerListOfFilter(tempArray)
        }else{
          setSelectedPartner(tempArray[0])
          setPartnerListOfFilter(tempArray)
        }

        setPartnerListLoading(false)

        
        
    })
    .catch((error) => {
        setPartnerListLoading(false)
    });
  }


  const validateInitializationClaim=()=>{
    var claimValidation = validateClaimExceeding(claimAmount);
    setLoader(true)
    console.log(claimAmount +":::::" + JSON.stringify(selectedClaim.policy.plan.balance))
    if(claimValidation ==false){
      setLoader(false)
    }else if(billPhoto.length ==0){
      Helper.showFlashMessage("Add bill photo", global.alert);
      setLoader(false)
    }else if(claimAmount == 0){
       Helper.showFlashMessage("Add claim amount", global.alert);
       setLoader(false)
    }else{
      console.log('All fine>>>>>>>>>>>>>>>')
      uploadBillPhoto()
    }
  }

  const validateClaimExceeding=(amount)=>{
   var status = true;

   var index = planData.plan.benefitAmount.findIndex(x=>x.name.toLowerCase() === selectedClaim.selectedInsuranceType.name.toLowerCase())
    console.log(index)

    // if(claimAmount > planData.plan.benefitAmount[index].value){
    //   Helper.showFlashMessage("Insufficient balance for "+planData.plan.benefitAmount[index].name, global.alert);
    //   status = false;
    // }else 

    if( ((Number(amount)) +Number(planData.plan.benefitAmount[index].initiatedAmount)) > planData.plan.benefitAmount[index].value){
        Helper.showFlashMessage("Claim amount exceeds available balance", global.alert);
        console.log('Entered amount is under benefitAmount amount '+((Number(amount)) +Number(planData.plan.benefitAmount[index].initiatedAmount)))
        status = false
    }

    return status;

  }


  


  const selectBillPhoto=()=>{

    launchCamera({selectionLimit:1}, (e)=>{
      
      if(e.hasOwnProperty("didCancel") == true){
        Helper.showFlashMessage("No bill photo selected", global.alert);
      }else{
        console.log(JSON.stringify('++++++++++++++++'+e.assets[0].uri))

        ImageResizer.createResizedImage(e.assets[0].uri, global.imageHeight, global.imageWidth, 'JPEG', global.quality, 0)
          .then(response => {
            console.log('mmmmmmselectBillPhotommmmmmmmmmmmm>>>>'+JSON.stringify(response))
            setBillPhoto(response.uri); 
            
          })
          .catch(err => {
            console.log(err)
            
          });

        // setBillPhoto(e.assets[0].uri); 
      }
    })
  }



  const uploadBillPhoto=()=>{
    storage().ref('claims/'+selectedClaim.claimId+'/billPhoto/'+selectedClaim.claimId+'.jpg').putFile(billPhoto)
    .then((response) => {
      console.log("Bill photo uploaded>>>>>>>>>>>>>");
      // updateProofLinkToOrder(id);
      updateBillPhotoToClaim();
    })
    .catch((error) => {
        console.error("Error upload document: ", error);
        setLoader(false)
        
    });
  }


  const updateBillPhotoToClaim = async ()=>{
    var link = await getBillPhotoDownloadUrl();
    var data = { billPhoto: link, status:'submitted', claimSum: Number(claimAmount), submittedOn:moment().unix()}
    db.collection("claims").doc(selectedClaim.claimId).set(data, {merge:true})
    .then((response) => {
      updatePolicy()
      console.log("bill photo and status updated>>>>>>>>>>>>>");
      Helper.getNotificationToAdminList('submitted', selectedClaim.claimId)
      getSubmittedClaims();
      getInitiatedClaims();
      setModalVisible(false)
      setLoader(false)
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        setLoader(false)
        
    });
  }



  const updatePolicy=()=>{

    var index = planData.plan.benefitAmount.findIndex(x=>x.name.toLowerCase() === selectedClaim.selectedInsuranceType.name.toLowerCase())

    var tempPlanData = planData;

    tempPlanData.plan.benefitAmount[index].initiatedAmount = Number(planData.plan.benefitAmount[index].initiatedAmount) + Number(claimAmount);
      
    Helper.updatePolicyToFB(tempPlanData, planData.policyNumber)
  }


  const getBillPhotoDownloadUrl = async()=>{
    console.log("getting user bill url for "+selectedClaim.claimId);
    var downloadUrl = await storage().ref('claims/'+selectedClaim.claimId+'/billPhoto/'+selectedClaim.claimId+'.jpg').getDownloadURL();
    return downloadUrl;
  }


// -----------------------------------------------------submitted claims---------------------
  const getSubmittedClaims=()=>{
    var query;
    if(role == 'admin'){
      if(filterApplied == false){
        query = db.collection("claims")
              .where('status', '==', "submitted")
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
      }else{
        query = db.collection("claims")
              .where('status', '==', "submitted")
              .where('partnerID', '==', selectedPartner.partnerId)
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
      }
      
    }else{
      query = db.collection("claims")
              .where('createdBy', '==', global.userData.uid)
              .where('status', '==', "submitted") 
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
    }

    query.get()
    .then((querySnapshot) => {
      var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
      setLastVisibleSubmittedClaims(lastVisible)

      setSubmittedClaimsPagination(true)

      var tempArray = []
      querySnapshot.forEach((doc) => {
           console.log('doc.data()>>>>>>>>>>>>>'+doc.data().claimId)
           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })

        
        setSubmittedClaimList(tempArray)
    })
  }


  const getNextSubmittedClaims=()=>{
    if (submittedClaimsPagination) {
    setLoading(true)
    var query;
    if(role == 'admin'){
      if(filterApplied){
        console.log("I am in filter selected:::::::::"+selectedPartner.partnerId)
        query = db.collection("claims")
              .where('status', '==', "submitted")
              .where('partnerID', '==', selectedPartner.partnerId)
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
              .startAfter(lastVisibleSubmittedClaims)
      }else{
       query = db.collection("claims")
              .where('status', '==', "submitted")
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
              .startAfter(lastVisibleSubmittedClaims) 
      }
      
    }else{
      query = db.collection("claims")
              .where('createdBy', '==', global.userData.uid)
              .where('status', '==', "submitted")
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
              .startAfter(lastVisibleSubmittedClaims)
    }

    query.get()
    .then((querySnapshot) => {
      var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
      setLastVisibleSubmittedClaims(lastVisible)

      var tempArray = []
      tempArray = submittedClaimList ;
      querySnapshot.forEach((doc) => {
           console.log('doc.data()>>>>>>>>>>>>>'+doc.data().claimId)
           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })

        if(querySnapshot.docs.length < global.pagination){
          console.log('tempArray.lengthtempArray.lengthtempArray.lengthtempArray.length:::'+tempArray.length)
          setSubmittedClaimsPagination(false)
        }
        
        setSubmittedClaimList([...tempArray],[setLoading(false)])
    })
  }
}

// -----------------------------------------------------Approvals claims---------------------
  const getApprovedClaims=()=>{
    console.log(index+'++++++++++++++++++++getApprovedClaims++++++++++++++++++++++++++++++++')
    var query;
    if(role == 'admin'){
      if(filterApplied == false){
        query = db.collection("claims")
              .where('status', '==', "approved")
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
      }else{
        query = db.collection("claims")
              .where('status', '==', "approved")
              .where('partnerID', '==', selectedPartner.partnerId)
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
      }

      
    }else{
      query = db.collection("claims")
              .where('createdBy', '==', global.userData.uid)
              .where('status', '==', "approved") 
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
    }

    query.get()
    .then((querySnapshot) => {
      var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
      setLastVisibleApprovedClaims(lastVisible)

      setApprovedClaimsPagination(true)

      var tempArray = []
      querySnapshot.forEach((doc) => {
           console.log('doc.data()>>>>>>>>>>>>>'+doc.data().claimId)
           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })
        
        setApprovedClaimList(tempArray)
    })
  }


  const getNextApprovedClaims=()=>{
    console.log(index+'++++++++++++++++++++getNextApprovedClaims++++++++++++++++++++++++++++++++'+lastVisibleApprovedClaims)
    if (approvedClaimsPagination) {
    setLoading(true)
    var query;
    if(role == 'admin'){
      if(filterApplied){
        query = db.collection("claims")
              .where('status', '==', "approved")
              .where('partnerID', '==', selectedPartner.partnerId)
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
              .startAfter(lastVisibleApprovedClaims)
      }else{
        query = db.collection("claims")
              .where('status', '==', "approved")
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
              .startAfter(lastVisibleApprovedClaims)
      }
      
    }else{
      query = db.collection("claims")
              .where('createdBy', '==', global.userData.uid)
              .where('status', '==', "approved")
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
              .startAfter(lastVisibleApprovedClaims)
    }

    query.get()
    .then((querySnapshot) => {
      var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
      setLastVisibleApprovedClaims(lastVisible)

      var tempArray = []
      tempArray = approvedClaimList ;
      querySnapshot.forEach((doc) => {
           console.log('doc.data()>>>>>>>>>>>>>'+doc.data().claimId)
           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })

        if(querySnapshot.docs.length < global.pagination){
          console.log('tempArray.lengthtempArray.lengthtempArray.lengthtempArray.length:::'+tempArray.length)
          setApprovedClaimsPagination(false)
        }
        
        setApprovedClaimList([...tempArray],[setLoading(false)])
    })
  }
}

// -----------------------------------------------------Inititalized claims---------------------
  const getInitiatedClaims=()=>{
    var query;
    if(role == 'admin'){
      if(filterApplied == false){
        query = db.collection("claims")
              .where('status', 'in', ["initiated","rejected"])
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
      }else{
        query = db.collection("claims")
              .where('status', 'in', ["initiated","rejected"])
              .where('partnerID', '==', selectedPartner.partnerId)
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
      }

      
    }else{
      query = db.collection("claims")
              .where('createdBy', '==', global.userData.uid)
              .where('status', 'in', ["initiated","rejected"]) 
              .orderBy('createDate', 'desc')
              .limit(global.pagination)
    }

    query.get()
    .then((querySnapshot) => {
      var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
      setLastVisibleInitiatedClaims(lastVisible)


      setInitiatedClaimsPagination(true)

      var tempArray = []
      querySnapshot.forEach((doc) => {
           console.log('doc.data()>>>>>>>>>>>>>'+doc.data().claimId)
           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })
        
        setInitiatedClaimList(tempArray)
    })
  }


  const getNextInitiatedClaims=()=>{

    console.log(index+'::fetching next initiated set>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+(lastVisibleInitiatedClaims))

    if (initiatedClaimsPagination) {
    setLoading(true)
    var query;
    if(role == 'admin'){
      if(filterApplied){
        query = db.collection("claims")
              .where('status', 'in', ["initiated","rejected"])
              .where('partnerID', '==', selectedPartner.partnerId)
              .limit(global.pagination)
              .startAfter(lastVisibleInitiatedClaims)
      }else{
        query = db.collection("claims")
              .where('status', 'in', ["initiated","rejected"])
              .limit(global.pagination)
              .startAfter(lastVisibleInitiatedClaims)
      }
      
    }else{
      query = db.collection("claims")
              .where('createdBy', '==', global.userData.uid)
              .where('status', 'in', ["initiated","rejected"]) 
              .limit(global.pagination)
              .startAfter(lastVisibleInitiatedClaims)
    }

    query.get()
    .then((querySnapshot) => {
      var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
      setLastVisibleInitiatedClaims(lastVisible)

      var tempArray = []
      tempArray = initiatedClaimList ;
      querySnapshot.forEach((doc) => {
           console.log('doc.data()>>>>>>>>>>>>>'+doc.data().claimId)
           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })

        if(querySnapshot.docs.length < global.pagination){
          console.log('tempArray.lengthtempArray.lengthtempArray.lengthtempArray.length:::'+tempArray.length)
          setInitiatedClaimsPagination(false)
        }
        
        setInitiatedClaimList([...tempArray],[setLoading(false)])

    })
  }
}

// -----------------------------------------------------settled claims---------------------
  const getSettledClaims=()=>{
     var query;
    if(role == 'admin'){
      if(filterApplied == false){
        query = db.collection("claims")
              .where('status', '==', "settled")
              .limit(global.pagination)
      }else{
        query = db.collection("claims")
              .where('status', '==', "settled")
              .where('partnerID', '==', selectedPartner.partnerId)
              .limit(global.pagination)
      }
      
    }else{
      query = db.collection("claims")
              .where('createdBy', '==', global.userData.uid)
              .where('status', '==', "settled") 
              .limit(global.pagination)
    }

    query.get()
    .then((querySnapshot) => {
      var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
      setLastVisibleSettledClaims(lastVisible)

      setSettledClaimsPagination(true)

      var tempArray = []
      querySnapshot.forEach((doc) => {
           console.log('doc.data()>>>>>>>>>>>>>'+doc.data().claimId)
           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })
        
        setSettledClaimList(tempArray)
    })
  }

  const getNextSettledClaims=()=>{
    console.log(index+'::fetching next SettledClaims set>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+(lastVisibleSettledClaims))


    if (settledClaimsPagination) {

    setLoading(true)
    var query;
    if(role == 'admin'){
      if(filterApplied){
        query = db.collection("claims")
              .where('status', '==', "settled")
              .where('partnerID', '==', selectedPartner.partnerId)
              .limit(global.pagination)
              .startAfter(lastVisibleSettledClaims)
      }else{
        query = db.collection("claims")
              .where('status', '==', "settled")
              .limit(global.pagination)
              .startAfter(lastVisibleSettledClaims)
      }
      
    }else{
      query = db.collection("claims")
              .where('createdBy', '==', global.userData.uid)
              .where('status', '==', "settled") 
              .limit(global.pagination)
              .startAfter(lastVisibleSettledClaims)
    }

    query.get()
    .then((querySnapshot) => {
      var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
      setLastVisibleSettledClaims(lastVisible)

      var tempArray = []
      tempArray = settledClaimList ;
      querySnapshot.forEach((doc) => {
           console.log('doc.data()>>>>>>>>>>>>>'+doc.data().claimId)
           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })

        if(querySnapshot.docs.length < global.pagination){
          console.log('tempArray.lengthtempArray.lengthtempArray.lengthtempArray.length:::'+querySnapshot.docs.length)
          setSettledClaimsPagination(false)
        }
        
        setSettledClaimList([...tempArray],[setLoading(false)])
    })
  }
}


const deleteAlert = () =>
    Alert.alert(
      "DELETE",
      "Are you sure want to delete this claim ?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => deleteInitializedClaim() }
      ]
    );

const deleteInitializedClaim = () =>{
    db.collection("claims").doc(selectedClaim.claimId).delete()
    .then((querySnapshot) => {
      setModalVisible(false)
      updateTabs()
      Helper.showFlashMessage("Claim deleted successfully", global.alert);
    })

  }


  const onOpenMyPlan = () => {
    claimPopupContent.current?.open();
  };

  const onCloseMyPlan = () => {
    claimPopupContent.current?.close();
  };


  const updateClaim = (e) => {

    var claimValidation = validateClaimExceeding(updatedClaimAmount);
    // setLoader(true)
    console.log(updatedClaimAmount +":::::" + JSON.stringify(selectedClaim.policy.plan))
    if(claimValidation ==false){
      setLoader(false)
    }else{
      db.collection("claims").doc(selectedClaim.claimId).set({status:e, claimSum:updatedClaimAmount, approvedOn:moment().unix(), approvedClaimAmount: updatedClaimAmount},{merge:true})
      .then((doc) => {
        finalSettlement(e)
        // updatePolicyAmount()
        updateTabs()
        onCloseMyPlan()
        setAcceptClaimModal(false)
        setLoader(false)

        Helper.getNotificationToUser(selectedClaim.policy.uid, e, selectedClaim.claimId)
      })
      .catch((error) => {
          console.error("Error writing document: ", error);
          setLoader(false)
      });
    }
  }


  const finalSettlement=(e)=>{

    var index = planData.plan.benefitAmount.findIndex(x=>x.name.toLowerCase() === selectedClaim.selectedInsuranceType.name.toLowerCase())

    var tempPlanData = {};
    tempPlanData = planData;

    tempPlanData.plan.benefitAmount[index].initiatedAmount = Number(planData.plan.benefitAmount[index].initiatedAmount) - Number(selectedClaim.claimSum);

    console.log(tempPlanData.plan.benefitAmount[index].value+'-----------------'+updatedClaimAmount)

    if(e == 'approved'){
      tempPlanData.plan.benefitAmount[index].value = Number(tempPlanData.plan.benefitAmount[index].value) - Number(updatedClaimAmount)
    }
    

    Helper.updatePolicyToFB(tempPlanData, tempPlanData.policyNumber)

  }


  // const updatePolicyAmount = (e) => {
  //   var newBalance = Number(selectedClaim.policy.plan.balance) - Number(updatedClaimAmount);
  //   console.log('++++++++++++++++++++++++'+selectedClaim.policy.policyNumber)

  //   db.collection("orders").doc(selectedClaim.policy.policyNumber).set({plan:{balance:newBalance}},{merge:true})
  //   .then((doc) => {
  //     updateTabs()
  //     onCloseMyPlan()
  //     setAcceptClaimModal(false)
  //     setLoader(false)
  //   })
  //   .catch((error) => {
  //       console.error("Error writing document: ", error);
  //       setLoader(false)
  //   });
  // };



  const updateSettlementTransaction = (e) => {
    setLoader(true)
    db.collection("claims").doc(selectedClaim.claimId).set({status:e, transaction:{mode: settledClaimMode, refrence: settledClaimRefrence, settledOn: moment().unix()}},{merge:true})
    .then((doc) => {
      updateTabs()
      onCloseMyPlan()
      setTransactionClaimModal(false)
      setLoader(false)
      Helper.getNotificationToUser(selectedClaim.policy.uid, e, selectedClaim.claimId)
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        setLoader(false)
        
    });
  };



  const rejectClaim = (e) => {

    db.collection("claims").doc(selectedClaim.claimId).set({status:e, rejectedOn:moment().unix()},{merge:true})
    .then((doc) => {
      finalSettlement(e)
      updateTabs()
      onCloseMyPlan()
      Helper.getNotificationToUser(selectedClaim.policy.uid, e, selectedClaim.claimId)
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        
    });
  };

  const updateTabs=()=>{
    console.log(filterApplied+"Updating tabs>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+selectedPartner.partnerId)
      getSubmittedClaims();
      getInitiatedClaims();
      getApprovedClaims();
      getSettledClaims();
  }




   const getPlanData = (item, index)=>{

    console.log('Index:::::::::::::'+index)

    db.collection("orders").doc(item.policy.policyNumber).get()
    .then((doc) => {
      console.log("bill photo and status updated>>>>>>>>>>>>>"+JSON.stringify(doc.data()));
      if(index == 0){
        setPlanData(doc.data(),[setModalVisible(true)])
      }else{
        setPlanData(doc.data(),[onOpenMyPlan()])
      }
      
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        setLoader(false)
    });
  }


  const getPartnerData = (item)=>{
    console.log("Partner Data of item>>>>>>>>>>>>>"+JSON.stringify(item.partnerID));
    db.collection("partners").doc(item.partnerID).get()
    .then((doc) => {
      console.log("Partner Data of claim>>>>>>>>>>>>>"+JSON.stringify(doc.data()));
      setPartnerData(doc.data())
      
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        setLoader(false)
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
    console.log('+++++++++++++++benefitInitiatedAmount+++++++++++++++'+e.length)
    var tempArray = [];
    if(e.length !== null){
      
      var eachElement;
      for (var i = 0; i < e.length; i++) {
        var eachElement;
        if(e[i].initiatedAmount >0){
          eachElement =  <Text style={{color:global.text, fontSize:10}}>₹ {e[i].initiatedAmount}</Text>
        }else{
          eachElement =  <Text style={{color:global.text, fontSize:10}}>-</Text>
        }

        tempArray.push(eachElement)
       
      }

    }

    return tempArray;
  }



  const applyFilter=()=>{
    setFilterApplied(true)
    setFilterModal(false)
    console.log('FilterLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL'+JSON.stringify(selectedPartner))
    
  }

  const resetFilter=()=>{
    setFilterApplied(false)
    setPartnerListOfFilter([])
    setSelectedState("Nagaland")
    setSelectedCity("Dimapur")
    setSelectedPartner({})

  }






  const renderItem = ({item}) => {

        return( 
         <TouchableOpacity  style={{width:windowWidth, height:140}} onPress={()=>{ getPartnerData(item); if(index==0){ setSelectedClaim(item,[getPlanData(item, index)]) } else{ setSelectedClaim(item,[getPlanData(item, index)]) }  }}>
          <View style={{backgroundColor:global.white, borderRadius:10, height:120, padding:15, justifyContent:'center', marginLeft:10, marginRight:10}}>

            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
              <View style={{paddingRight:0, borderColor:global.border}}>
                <Text style={{color:global.text, fontSize:11}}>Claim Id</Text>
                <Text style={{fontWeight:'bold', color:global.primary, fontSize:11}}>{item.claimId}</Text>

                <View>
                  <Text style={{fontSize:10, marginTop:2, color:global.text, marginTop:15}}>Submitted on: {moment(item.createDate*1000).format('DD-MM-YYYY hh:mm A')}</Text>
                  <Text style={{fontSize:10, color:global.text}}>Policy Number: {item.policy.policyNumber}</Text>
                  <Text style={{fontSize:10, color:global.text}}>Status: {item.status}</Text>
                  <Text style={{fontSize:10, color:global.text}}>Type: {item.selectedInsuranceType
                    .name}</Text>
                </View>
              </View>

              <View style={{height:'100%', backgroundColor:global.info, width:0.5}}>

              </View>
              {index == 0?
                
                  <View style={{alignItems:'center', alignItems:'center'}}>
                    <FontAwesome5 name={'plus-circle'} light style={{fontSize:20, color:global.text, paddingLeft:5}}/>
                    <Text style={{fontSize:10, color:global.text, marginTop:5}}>{item.status=='rejected'?'SUBMIT AGAIN':'SUBMIT CLAIM'}</Text>
                    <Text style={{fontSize:8, color:global.info, marginTop:5}}>(Tap to submit claim)</Text>
                  </View>
                :
                <View style={{justifyContent:'center', alignItems:'center'}}>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Text style={{fontSize:14, color:global.text, fontWeight:'bold'}}>₹ {item.claimSum}</Text>
                    {index==3?<FontAwesome5 name={'check-circle'} solid style={{fontSize:12, color:global.success, paddingLeft:5}}/>:null}
                  </View>
                  <Text style={{fontSize:10, marginTop:5}}>( Claim amount )</Text>
                </View>
              }

            </View>

          </View>
        </TouchableOpacity>

      )
  }


  const listEmptyComponent = () =>{
    return(
      <View style={{flex:1, justifyContent:'center', alignItems:'center', height:windowHeight-200}}>
        {/*<Image
                      resizeMode = {'contain'}
                      style={{width: windowWidth, height:(windowWidth)*0.54}}
                      source={require('../assets/empty.png')}
                    />*/}
        <Text style={{color:global.info, marginTop:20, color:global.info, fontSize:16}}>No claims available</Text>
      </View>
    )
  }


  const renderState=()=>{
    var tempArray = [];

    for (var i = 0; i < stateList.length; i++) {
      var eachElement = <Picker.Item label={stateList[i]} value={stateList[i]} />
      tempArray.push(eachElement)
    }

    return tempArray;

  }


  const renderCity=()=>{
    var tempArray = [];

    for (var i = 0; i < cityList.length; i++) {
      var eachElement = <Picker.Item label={cityList[i]} value={cityList[i]} />
      tempArray.push(eachElement)
    }

    return tempArray;

  }


  const renderCenter=()=>{
    var tempArray = [];
      if(partnerListOfFilter.length > 0){
        for (var i = 0; i < partnerListOfFilter.length; i++) {
          var eachElement = <Picker.Item label={partnerListOfFilter[i].name} value={partnerListOfFilter[i].name} />
          tempArray.push(eachElement)
        }

      }
      return tempArray;

  }

  
  return (
    <View style={{flex:1, backgroundColor:global.background}}>
        
        <View style={{flexDirection:'row', justifyContent:'space-between', paddingLeft:10, paddingRight:10, height:50, alignItems:'center', marginTop:10}}>
          
          <View style={{flexDirection:'row', alignItems:'center', paddingLeft:10, height:50}}>
            <Text  style={{color:global.info}}>CLAIMS</Text>
          </View>



          {role=='admin'?
          <View style={{flexDirection:'row', alignItems:'center'}}>
            {filterApplied?
            <TouchableOpacity style={{flexDirection:'row', alignItems:'center',marginRight:10, backgroundColor:global.primary, padding:3, borderRadius:3, paddingLeft:5, paddingRight:5}} onPress={()=>{resetFilter()}}>
              <Text style={{marginRight:10, color:global.white}}>{selectedPartner.name}</Text>
              <FontAwesome5 name={'times'} light style={{fontSize:15, color:global.white}}/>
            </TouchableOpacity>
            :
            <TouchableOpacity style={{flexDirection:'row', alignItems:'center', paddingRight:5}} onPress={()=>{getPartnerListOfFilter(selectedCity); setFilterModal(true)}}>
              <FontAwesome5 name={'sliders-h-square'} light style={{fontSize:25, color:global.black}}/>
            </TouchableOpacity>
            }
          </View>
          :
          <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={()=>{getNextInitiatedClaims()}}>
            <Image
              style={{height:18,width:18}}
              source={require('../assets/logoGrey.png')}
            />
            <Text style={{fontSize:18, fontWeight:'bold', paddingLeft:5, color:global.info}}>Monaram</Text>

          </TouchableOpacity>
          }



        </View>

        <View style={{alignItems:'center'}}>
          <View style={{backgroundColor:global.white, borderRadius:5, width:'90%',marginBottom:20}}>
          <SegmentedControlTab
              values={["Initiated","Submitted", "Approved","Settled"]}
              selectedIndex={index}
              onTabPress={(e)=>{setIndex(e)}}
              tabStyle={{borderColor:global.primary}}
              tabTextStyle={{color:global.primary}}
              activeTabStyle={{backgroundColor:global.primary}}
            />
          </View>
        </View>


         <FlatList
              data={index ==0? initiatedClaimList: index ==1? submittedClaimList: index ==2? approvedClaimList:settledClaimList }
              renderItem={(item)=>renderItem(item)}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={listEmptyComponent}
              onEndReached={()=>{index ==0? getNextInitiatedClaims(): index ==1? getNextSubmittedClaims(): index ==2? getNextApprovedClaims():getNextSettledClaims()}}
              onEndReachedThreshold={0.3}
              ListFooterComponent={()=>(
                <View>
                  {loading?
                    <View style={{width:'100%', alignItems:'center', height:50}}>
                      <ActivityIndicator size="small" color="#0000ff" />
                    </View>
                    :null
                  }
                </View>
                )}

              refreshControl={<RefreshControl
                    refreshing={refreshing}
                    onRefresh={()=>{index ==0? getInitiatedClaims(): index ==1? getSubmittedClaims(): index ==2? getApprovedClaims():getSettledClaims()}}
                  />
               }

            />


        <Modalize 
        ref={claimPopupContent}
        modalHeight={windowHeight-200}
        >
        
        <View style={{justifyContent:'center'}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', height:50, alignItems:'center', marginTop:10, borderBottomWidth:1, borderColor:global.border, paddingBottom:10}}>

              {role == 'admin'?
              <View style={{paddingLeft:20, flexDirection:'row'}}>
                {selectedClaim.status == 'settled'?
                <View style={{paddingLeft:0}}>
                   <Text style={{fontWeight:"bold", fontSize:16, color:global.primary}}>CLAIM DETAILS</Text>
                </View>
                :
                  <View style={{flexDirection:'row'}}>
                    <TouchableOpacity style={{width:80, backgroundColor:global.success, height:40, justifyContent:'center', alignItems:'center', borderRadius:5}} onPress={()=>{if(selectedClaim.status=='submitted'){setAcceptClaimModal(true,[setUpdatedClaimAmount(selectedClaim.claimSum)])}else if(selectedClaim.status=='approved'){setTransactionClaimModal(true) } }}>
                      <Text style={{color:global.white}}>{selectedClaim.status=='submitted'? 'Approve':selectedClaim.status=='approved'? 'Settle':null}</Text>
                    </TouchableOpacity>
                  
                    <TouchableOpacity style={{width:80, backgroundColor:global.white, height:40, justifyContent:'center', alignItems:'center', borderRadius:5, marginLeft:20, borderWidth:0.5, borderColor:global.text}} onPress={()=>{rejectClaim("rejected")}}>
                      <Text style={{color:global.text}}>Reject</Text>
                    </TouchableOpacity>
                </View>
               }
                  
              </View>
              :null
              }

              {role == 'admin'?
                null:
                <View style={{paddingLeft:20}}>
                   <Text style={{fontWeight:"bold", fontSize:16, color:global.primary}}>CLAIM DETAILS</Text>
                </View>
                
                }
              <TouchableOpacity style={{paddingRight:20, height:'100%', justifyContent:'center', paddingLeft:20}}  onPress={()=>{onCloseMyPlan()}}>
                 <FontAwesome5 name={'times'} light style={{fontSize:25, color:global.black}}/>
              </TouchableOpacity>
            </View>
        </View>

        <View style={{marginLeft:'5%', justifyContent:'space-between', flexDirection:'row', marginRight:'5%', marginTop:20}}>
          <View>
            <Text style={{fontSize:10, color:global.info}}>Claim Id</Text>
            <Text style={{fontSize:12, color:global.primary}}>{selectedClaim.claimId}</Text>
            <Text style={{fontSize:10, color:global.info}}>Status: {selectedClaim.status}</Text>
            {selectedClaim.status == 'settled'?
              <View>
                <Text style={{fontSize:12, color: global.primary, marginTop:10}}>Transcation</Text>
                <Text style={{fontSize:10, color: global.info}}>Mode: {selectedClaim.transaction.mode}</Text>
                <Text style={{fontSize:10, color: global.info}}>Transction ID: {selectedClaim.transaction.refrence}</Text>
              </View>
              :null
            }

            {partnerData.hasOwnProperty("name")? 
            <View>
              <Text style={{fontSize:10, marginTop:20, color:global.info}}>Initiated by</Text>
              <View>
                <Text style={{fontSize:12, color:global.primary}}>{partnerData.name}</Text>
                <View style={{flexDirection:'row'}}>
                  <Text style={{fontSize:12}}>{partnerData.address}</Text>
                  <Text style={{fontSize:12}}>, {partnerData.addressCont}</Text>
                </View>
                <View style={{flexDirection:'row'}}>
                  <Text style={{fontSize:12}}>{partnerData.city}</Text>
                  <Text style={{fontSize:12}}>, {partnerData.state}</Text>
                </View>
                <Text style={{fontSize:12}}>{partnerData.pin}</Text>
              </View>
            </View>
            :null
            }

          </View>
          <View>
            <Text style={{fontSize:10, color:global.info}}>Claim Amount</Text>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Text style={{fontSize:14, color:global.text, fontWeight:'bold'}}>₹ {selectedClaim.claimSum}</Text>
              {index==3?<FontAwesome5 name={'check-circle'} solid style={{fontSize:12, color:global.success, paddingLeft:5}}/>:null}
            </View>
          </View>
        </View>


        <View style={{marginTop:30, marginLeft:'5%', flexDirection:'row'}}>
          <View>
            <Text style={{fontSize:10, color:global.primary}}>USER PHOTO</Text>
            <TouchableOpacity style={{alignItems:'center', backgroundColor:'white', borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:global.info, marginTop:5}} onPress={()=>{myselectedImage(selectedClaim.userPhoto)}}>
               <Image
                  style={{height:80,width:80, borderRadius:5}}
                  source={{uri:selectedClaim.userPhoto}}
                />
            </TouchableOpacity>
          </View>



          {index ==0?
          <View style={{marginLeft:40}}>
            <Text style={{fontSize:10, color:global.primary}}>BILL / PRESCRIPTION PHOTO</Text>
            <TouchableOpacity style={{alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:global.info, marginTop:5}} onPress={()=>{}}>
              <Text style={{fontSize:12}}>+ ADD FILE</Text>
            </TouchableOpacity>
          </View>
          :          
          <View style={{marginLeft:40}}>
            <Text style={{fontSize:10, color:global.primary}}>BILL / PRESCRIPTION PHOTO</Text>
            <TouchableOpacity style={{alignItems:'center', backgroundColor:'white', borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:global.info, marginTop:5}} onPress={()=>{myselectedImage(selectedClaim.billPhoto)}}>
               <Image
                  style={{height:80,width:80, borderRadius:5}}
                  source={{uri:selectedClaim.billPhoto}}
                />
            </TouchableOpacity>
          </View>
          }


        </View>

        <Text style={{fontSize:10, color:global.primary, marginLeft:'5%', marginTop:30}}>INJURY PHOTO</Text>
        <FlatGrid
              itemDimension={85}
              data={selectedClaim.injuryPhotos}
              style={{paddingBottom:50}}
              extraData ={selectedClaim.injuryPhotos}
              spacing={10}
              renderItem={({ item, index }) => (
                <View style={{height:80, justifyContent:'center'}}>
                    <TouchableOpacity style={{alignItems:'center', backgroundColor:'white', borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:global.info, marginLeft:10}} onPress={()=>{myselectedImage(item)}}>
                       <Image
                          style={{height:80,width:80, borderRadius:5}}
                          source={{uri:item}}
                        />
                    </TouchableOpacity>
                </View>
              )}
            />

          <View style={{flexDirection:'row', justifyContent:'space-between', width:'90%', marginLeft:'5%', marginTop:10, marginBottom:50}}>
            <View>
              <Text style={{color:global.info, fontSize:12, marginBottom:5}}>BALANCE</Text>
              {planData.hasOwnProperty("plan")? benefitAmount(planData.plan.benefitAmount):null}
            </View>
            <View>
              <Text style={{fontSize:12, color:global.info, marginBottom:5}}>INITIATED AMOUNT</Text>
              {planData.hasOwnProperty("plan")? benefitInitiatedAmount(planData.plan.benefitAmount):null}
            </View>
          </View>


          


    </Modalize>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false)
        }}>
        
        <View style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>

          <View style={{position:'absolute', backgroundColor:'black', flex:1, height:'100%', width:'100%', opacity:0.5, zIndex:0}}>


          </View>
          
          <View style={{width:windowWidth-100, height:425, backgroundColor:global.background, borderRadius:10, justifyContent:'center'}}>
              
              <TouchableOpacity style={{position:'absolute', right:0,top:0, height:40, width:60,  justifyContent:'center', alignItems:'center'}} onPress={()=>{setModalVisible(false)}}>
                <FontAwesome5 name={'times'} light style={{fontSize:20, marginLeft:5, color:global.text}}/>
              </TouchableOpacity>

              <View style={{marginLeft:'5%'}}>
                <Text style={{fontSize:10, color:global.primary}}>BILL / PRESCRIPTION PHOTO </Text>
                
                {billPhoto.length !==0?
                    <View style={{alignItems:'center', backgroundColor:'white', borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:global.info, marginTop:10}} onPress={()=>{checkCameraPermission()}}>
                     <Image
                        style={{height:80,width:80, borderRadius:5}}
                        source={{uri:billPhoto}}
                      />
                      <TouchableOpacity style={{position:'absolute',bottom:-10,right:-10, height:30, width:30, backgroundColor:global.text, justifyContent:'center', alignItems:'center', borderRadius:20}} onPress={()=>{setBillPhoto("")}}>
                      <FontAwesome5 name={'trash-alt'} solid style={{fontSize:15, color:'white'}}/>
                    </TouchableOpacity>
                  </View>
                  :
                  <TouchableOpacity style={{alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:global.info, marginTop:10}} onPress={()=>{checkCameraPermission()}}>
                    <Text style={{fontSize:10, color:global.text}}>+ ADD FILE</Text>
                  </TouchableOpacity>

                }
              </View>



              <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, borderColor:global.white, borderWidth:1, marginLeft:'5%', marginRight:'5%'}}>
                  <FontAwesome5 name={'rupee-sign'} light style={{fontSize:15, marginLeft:5, color:global.text}}/>
                  <TextInput
                    style={{width:'90%', height:50, paddingLeft:10, color:'#000000'}}
                    onChangeText={(text)=>{setClaimAmount(text)}}
                    value={claimAmount}
                    maxLength={10}
                    placeholder="Claim amount *"
                    placeholderTextColor={global.info}
                    keyboardType="numeric"
                  />
              </View>

              {loader?
              <View style={{alignItems:'center', justifyContent:'center', height:50, width:'90%',marginLeft:'5%', borderRadius:5, marginTop:20, flexDirection:'row'}}>
                  <Text style={{color:global.primary, fontSize:14}}>UPDATING .... </Text>
                  <ActivityIndicator size="small" color={global.primary} />
                </View>
              :
              <TouchableOpacity style={{alignItems:'center', justifyContent:'center', height:50, width:'90%', backgroundColor:global.primary, marginLeft:'5%', borderRadius:5, marginTop:20}} onPress={()=>{validateInitializationClaim()}}>
                <Text style={{color:global.white, fontSize:16}}>SAVE</Text>
              </TouchableOpacity>
              }

              <Text style={{fontSize:10, color:global.text, padding:10}}>To submit this order please add the above details</Text>

              <View style={{flexDirection:'row', justifyContent:'space-between', width:'90%', marginLeft:'5%', marginTop:10}}>
                <View>
                  <Text style={{color:global.text, fontSize:12, marginBottom:5}}>BALANCE</Text>
                  {planData.hasOwnProperty("plan")? benefitAmount(planData.plan.benefitAmount):null}
                </View>
                <View>
                  <Text style={{fontSize:12, color:global.info, marginBottom:5}}>INITIATED AMOUNT</Text>
                  {planData.hasOwnProperty("plan")? benefitInitiatedAmount(planData.plan.benefitAmount):null}
                </View>
              </View>

              <View style={{alignItems:'flex-end', width:'100%', marginTop:10}}>
                <TouchableOpacity style={{justifyContent:'center', alignItems:'center', height:50, width:50}} onPress={()=>{deleteAlert()}}>
                  <FontAwesome5 name={'trash'} light style={{fontSize:20, marginLeft:5, color:global.text}}/>
                </TouchableOpacity>
              </View>

          </View>

        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={acceptClaimModal}
        onRequestClose={() => {
          setAcceptClaimModal(false)
        }}>
        
        <View style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>

          <View style={{position:'absolute', backgroundColor:'black', flex:1, height:'100%', width:'100%', opacity:0.5, zIndex:0}}>


          </View>
          
          <View style={{width:windowWidth-100, height:300, backgroundColor:global.background, borderRadius:10, justifyContent:'center'}}>
              
              <TouchableOpacity style={{position:'absolute', right:0,top:0, height:40, width:40,  justifyContent:'center', alignItems:'center'}} onPress={()=>{setAcceptClaimModal(false)}}>
                <FontAwesome5 name={'times'} light style={{fontSize:20, marginLeft:5}}/>
              </TouchableOpacity>

              <Text style={{marginLeft:'5%', color:global.primary, fontWeight:'bold'}}>CLAIM AMOUNT</Text>

              <View style={{marginTop:20, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, borderColor:global.white, borderWidth:1, marginLeft:'5%', marginRight:'5%'}}>
                  <FontAwesome5 name={'rupee-sign'} light style={{fontSize:15, marginLeft:5}}/>
                  <TextInput
                    style={{width:'90%', height:50, paddingLeft:10, color:'#000000'}}
                    onChangeText={(text)=>{setUpdatedClaimAmount(text)}}
                    value={updatedClaimAmount}
                    maxLength={10}
                    placeholder="Claim amount *"
                    keyboardType="numeric"
                  />
              </View>

              {loader?
                <View style={{alignItems:'center', justifyContent:'center', height:50, width:'90%', marginLeft:'5%', borderRadius:5, marginTop:20, flexDirection:'row'}}>
                  <Text style={{color:global.primary, fontSize:14}}>UPDATING .... </Text>
                  <ActivityIndicator size="small" color={global.primary} />
                </View>
                :
                <TouchableOpacity style={{alignItems:'center', justifyContent:'center', height:50, width:'90%', backgroundColor:global.success, marginLeft:'5%', borderRadius:5, marginTop:20}} onPress={()=>{updateClaim("approved")}}>
                  <Text style={{color:global.white, fontSize:16}}>APPROVE</Text>
                </TouchableOpacity>
              }
              

          </View>

        </View>
      </Modal>


      <Modal
        animationType="slide"
        transparent={true}
        visible={transactionClaimModal}
        onRequestClose={() => {
          setTransactionClaimModal(false)
        }}>
        
        <View style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>

          <View style={{position:'absolute', backgroundColor:'black', flex:1, height:'100%', width:'100%', opacity:0.5, zIndex:0}}>


          </View>
          
          <View style={{width:windowWidth-100, height:300, backgroundColor:global.background, borderRadius:10, justifyContent:'center'}}>
              
              <TouchableOpacity style={{position:'absolute', right:0,top:0, height:40, width:40,  justifyContent:'center', alignItems:'center'}} onPress={()=>{setTransactionClaimModal(false)}}>
                <FontAwesome5 name={'times'} light style={{fontSize:20, marginLeft:5}}/>
              </TouchableOpacity>

              <Text style={{marginLeft:'5%', color:global.primary, fontWeight:'bold'}}>MODE</Text>

              {/*<View style={{marginTop:10, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, borderColor:global.white, borderWidth:1, marginLeft:'5%', marginRight:'5%', marginBottom:20}}>
                                <FontAwesome5 name={'coins'} light style={{fontSize:15, marginLeft:5}}/>
                                <TextInput
                                  style={{width:'90%', height:50, paddingLeft:10, color:'#000000'}}
                                  onChangeText={(text)=>{setSettledClaimMode(text)}}
                                  value={settledClaimMode}
                                  maxLength={20}
                                  placeholder="Google pay/ phone pay"
                                />
                            </View>*/}

              <View style={{marginTop:10, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, borderColor:global.white, borderWidth:1, marginLeft:'5%', marginRight:'5%', marginBottom:20}}>
                <Picker
                  selectedValue={settledClaimMode}
                  style={{ height: 50, width: '100%'}}
                  onValueChange={(itemValue, itemIndex) =>{setSettledClaimMode(itemValue)}} >
                  <Picker.Item label="Google Pay" value="Google Pay" />
                  <Picker.Item label="Phone Pay" value="Phone Pay" />
                  <Picker.Item label="BHIM UPI" value="BHIM UPI" />
                  <Picker.Item label="Internet Banking" value="Internet Banking" />
                  <Picker.Item label="By Cheque" value="By Cheque" />
                  <Picker.Item label="By Cash" value="By Cash" />
                </Picker>
              </View>

              <Text style={{marginLeft:'5%', color:global.primary, fontWeight:'bold'}}>REFRENCE</Text>

              <View style={{marginTop:10, flexDirection:'row', alignItems:'center', backgroundColor:'white', paddingLeft:5, borderRadius:5, borderColor:global.white, borderWidth:1, marginLeft:'5%', marginRight:'5%'}}>
                  <FontAwesome5 name={'receipt'} light style={{fontSize:15, marginLeft:5}}/>
                  <TextInput
                    style={{width:'90%', height:50, paddingLeft:10, color:'#000000'}}
                    onChangeText={(text)=>{setSettledClaimRefrence(text)}}
                    value={settledClaimRefrence}
                    maxLength={30}
                    placeholder={settledClaimMode=='Google Pay'? "Google pay refrence number": settledClaimMode=='Phone Pay'?  "Phone pay refrence number": settledClaimMode=='BHIM UPI'? "BHIM refrence number": settledClaimMode=='Internet Banking'? "Internet banking transaction ID": settledClaimMode=='By Cheque'? "Cheque number": "Cash amount"}
                  />
              </View>

              {loader?
                <View style={{alignItems:'center', justifyContent:'center', height:50, width:'90%', marginLeft:'5%', borderRadius:5, marginTop:20, flexDirection:'row'}}>
                  <Text style={{color:global.primary, fontSize:14}}>UPDATING .... </Text>
                  <ActivityIndicator size="small" color={global.primary} />
                </View>
                :
                <TouchableOpacity style={{alignItems:'center', justifyContent:'center', height:50, width:'90%', backgroundColor:global.success, marginLeft:'5%', borderRadius:5, marginTop:20}} onPress={()=>{updateSettlementTransaction("settled")}}>
                  <Text style={{color:global.white, fontSize:16}}>SAVE</Text>
                </TouchableOpacity>
              }
          </View>

        </View>
      </Modal>


      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModal}
        onRequestClose={() => {
          setFilterModal(false)
        }}>
        
        <View style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>

          <View style={{position:'absolute', backgroundColor:'black', flex:1, height:'100%', width:'100%', opacity:0.5, zIndex:0}}>


          </View>
          
          <View style={{width:windowWidth-100, height:400, backgroundColor:global.background, borderRadius:10}}>

            <View style={{}}>
              
              <TouchableOpacity style={{position:'absolute', right:0,top:0, height:40, width:40,  justifyContent:'center', alignItems:'center'}} onPress={()=>{setFilterModal(false)}}>
                <FontAwesome5 name={'times'} light style={{fontSize:20, marginLeft:5}}/>
              </TouchableOpacity>
            </View>

            <View style={{width:'100%', height:50, marginLeft:'5%', marginTop:40}}>
              <Text style={{marginBottom:5, fontSize:11}}>STATE </Text>
              <View style={{borderRadius:5, borderColor:global.info, borderWidth:1, width: '90%'}}>
                <Picker
                selectedValue={selectedState}
                style={{ height: 50}}
                enabled={false}
                onValueChange={(itemValue, itemIndex) => setSelectedState(itemValue)}>
                  {
                    renderState()
                  }
                </Picker>
              </View>
            </View>

            <View style={{width:'100%', height:50, marginLeft:'5%', marginTop:40}}>
              <Text style={{marginBottom:5, fontSize:11}}>CITY </Text>
              <View style={{borderRadius:5, borderColor:global.info, borderWidth:1, width: '90%'}}>
                <Picker
                selectedValue={selectedCity}
                style={{ height: 50}}
                onValueChange={(itemValue, itemIndex) => {setSelectedCity(itemValue,[getPartnerListOfFilter(itemValue)])}}>
                  {
                    renderCity()
                  }
                </Picker>
              </View>
            </View>

            {partnerListLoading?
            <View style={{width:'100%', height:50, marginLeft:'5%', marginTop:40, justifyContent:'center'}}>
              <Text>Loading...</Text>
            </View>
            :
            <View>
              {partnerListOfFilter.length>0?
              <View style={{width:'100%', height:50, marginLeft:'5%', marginTop:40}}>
                <Text style={{marginBottom:5, fontSize:11}}>CLINIC / HOSPITAL </Text>
                <View style={{borderRadius:5, borderColor:global.info, borderWidth:1, width: '90%'}}>
                  <Picker
                  selectedValue={selectedPartner.name}
                  style={{ height: 50}}
                  onValueChange={(itemValue, itemIndex) =>{console.log(partnerListOfFilter[itemIndex]); setSelectedPartner(partnerListOfFilter[itemIndex])}}>
                    {
                      renderCenter()
                    }
                  </Picker>
                </View>
              </View>
              :
              <View style={{width:'100%', height:50, marginLeft:'5%', marginTop:40, justifyContent:'center'}}>
                <Text>No centers available for {selectedCity}</Text>
              </View>
              }
            </View>
            }

            {partnerListOfFilter.length>0?

            
            <View style={{width:'100%', height:50, alignItems:'center', marginTop:50}}>
              <TouchableOpacity style={{justifyContent:'center', alignItems:'center', height:50, backgroundColor:global.primary, width:'90%', borderRadius:5}} onPress={()=>{applyFilter()}}>
                <Text style={{color:global.white}}>APPLY</Text>
              </TouchableOpacity>

            </View>
            :null
            }
              
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

export default Claims;
