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
  Modal
} from 'react-native';


import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';
import Plans from '../components/Plans';
import Info from '../components/Info';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';
import SegmentedControlTab from "react-native-segmented-control-tab";
import { Modalize } from 'react-native-modalize';

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

import * as Helper from '../common/Helper';


import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
const db = firestore()
var currentUser = auth().currentUser;


const CenterRequested = () => {
  const [requestedCenter, setRequestedCenter] = useState(true);
  const [rejectedCenter, setRejectedCenter] = useState(true);
  const [deactivatedCenter, setDeactivatedCenter] = useState(true);

  const [actionModal, setActionModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(false);
  // const [selectedImage, setSelectedImage] = useState("");
  const [imagePreview, setImagePreview]= useState(false);

  const [index, setIndex] = useState(0);

  const centerPoupupContent = useRef<Modalize>(null);

  useEffect(()=>{
    currentUser = auth().currentUser;
    getRequestedPatnerList();
    getRejectedPatnerList();
    getDeactivatedList();
  },[])

  const getRequestedPatnerList=()=>{
    console.log('fetching requested partner list>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    db.collection("partners")
    .where('status', '==', 'review')
    .orderBy('city', 'asc')
    .get()
    .then((querySnapshot) => {

      var tempArray = []
      querySnapshot.forEach((doc) => {

           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })
        global.requestedPartnerList = tempArray;
        console.log('doc.data()>>>>>>>>>>>>>'+JSON.stringify(tempArray))
        setRequestedCenter(tempArray)
    })
  }


  const getRejectedPatnerList=()=>{
    console.log('fetching requested partner list>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    db.collection("partners")
    .where('status', '==', 'rejected')
    .orderBy('city', 'asc')
    .get()
    .then((querySnapshot) => {

      var tempArray = []
      querySnapshot.forEach((doc) => {

           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })
        global.requestedPartnerList = tempArray;
        console.log('doc.data()>>>>>>>>>>>>>'+JSON.stringify(tempArray))
        setRejectedCenter(tempArray)
    })
  }


  const getDeactivatedList=()=>{
    console.log('fetching requested partner list>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    db.collection("partners")
    .where('status', '==', 'deactivated')
    .orderBy('city', 'asc')
    .get()
    .then((querySnapshot) => {

      var tempArray = []
      querySnapshot.forEach((doc) => {

           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })
        // global.requestedPartnerList = tempArray;
        console.log('doc.data()>>>>>>>>>>>>>'+JSON.stringify(tempArray))
        setDeactivatedCenter(tempArray)
    })
  }


  const onOpenCenter = () => {
    console.log('++++++++++++++++++++++++++++++++++++++++++'+JSON.stringify(selectedPartner))
    centerPoupupContent.current?.open();
  };

  const onCloseCenter = () => {
    centerPoupupContent.current?.close();
  };



  const updateCenter=(statusRecieved)=>{

    console.log('updateCenter requested partner list>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+(selectedPartner.partnerId))
    db.collection("partners").doc(selectedPartner.partnerId).set({status:statusRecieved},{merge:true})
    .then((querySnapshot) => {
      if(statusRecieved=="active"){

        if(selectedPartner.status == 'deactivated'){
          getRequestedPatnerList();
          getRejectedPatnerList();
          getDeactivatedList();
          onCloseCenter()
        }else{
          updateUserRole();
        }
        
        
      }else{
        Helper.getNotificationToUserForCenter(selectedPartner.createdBy, "rejected");
        getRequestedPatnerList();
        getRejectedPatnerList();
        getDeactivatedList();
        onCloseCenter()
      }
      
    })

  }


  const updateUserRole=()=>{
    db.collection("profile").doc(selectedPartner.createdBy).set({role:"partner", partnerID: selectedPartner.partnerId},{merge:true})
    .then((querySnapshot) => {
      Helper.getNotificationToUserForCenter(selectedPartner.createdBy, "accepted");
      getRequestedPatnerList();
      getRejectedPatnerList();
      getDeactivatedList();
      onCloseCenter()
    })
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


  const phoneNumber=(phone)=>{
    var tempArray = []
    for (var i = 0; i <phone.length; i++) {
      var eachElement = <Text style={{color:global.black, fontSize:9}}>+91 {phone[i]} </Text>
      tempArray.push(eachElement);
    }

    return tempArray;
  }


  const renderItem = ( {item} ) =>{
    console.log(JSON.stringify(item))
    return(
        <TouchableOpacity style={{width:'90%', height:110, backgroundColor:global.white, marginLeft:'5%', marginBottom:20, borderRadius:10, padding:10, flexDirection:'row', justifyContent:'space-between'}} onPress={()=>{setSelectedPartner(item,[onOpenCenter()] )}}>
          
          <View>
            <Text style={{color:global.black, fontSize:12, color:global.primary}}>{item.name}</Text>

            <Text style={{color:global.black, fontSize:11, marginTop:5}}>{item.address}</Text>
            <Text style={{color:global.black, fontSize:11}}>{item.addressCont}</Text>
           
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Text style={{color:global.black, fontSize:11}}>{item.city}</Text>
              <Text style={{color:global.black, fontSize:11}}>{item.state}</Text>
            </View>
            <Text style={{color:global.black, fontSize:11}}>{item.pin}</Text>
          </View>

          <View style={{alignItems:'flex-end'}}>
            <Text style={{color:global.black, fontSize:9, marginBottom:10}}>{item.email}</Text>
            {phoneNumber(item.phone)}
          </View>
        </TouchableOpacity>
        )
      };
  
  return (
    <View style={{flex:1, backgroundColor:global.background}}>
        <View style={{flexDirection:'row', justifyContent:'space-between', paddingLeft:10, paddingRight:10, height:50, alignItems:'center', marginTop:10}}>
              
              <TouchableOpacity style={{flexDirection:'row', alignItems:'center', paddingLeft:10, height:50}} onPress={()=>{ Actions.dashboard()}}>
          
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

          <View style={{padding:20}}>
            <SegmentedControlTab
                values={["Requested","Rejected", "Deactivated"]}
                selectedIndex={index}
                onTabPress={(e)=>{setIndex(e)}}
                tabStyle={{borderColor:global.primary}}
                tabTextStyle={{color:global.primary}}
                activeTabStyle={{backgroundColor:global.primary}}
              />
            </View>


          <FlatList
            data={index == 0?requestedCenter: index ==1?rejectedCenter: deactivatedCenter}
            renderItem={(item)=>renderItem(item)}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={listEmptyComponent}
          />


          <Modalize 
        ref={centerPoupupContent}
        modalHeight={windowHeight-200}
        >

        { selectedPartner.hasOwnProperty("partnerId")?
          <View style={{justifyContent:'center'}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', height:50, alignItems:'center', marginTop:10, borderBottomWidth:1, borderColor:global.border, paddingBottom:10}}>

          
              <View style={{paddingLeft:20, flexDirection:'row'}}>
                {index ==2?
                <View style={{flexDirection:'row'}}>
                  <TouchableOpacity style={{width:80, backgroundColor:global.success, height:40, justifyContent:'center', alignItems:'center', borderRadius:5}} onPress={()=>{updateCenter("active")}}>
                      <Text style={{color:global.white}}>ACTIVATE</Text>
                    </TouchableOpacity>
                </View>
                :
                <View style={{flexDirection:'row'}}>
                    
                    <TouchableOpacity style={{width:80, backgroundColor:global.success, height:40, justifyContent:'center', alignItems:'center', borderRadius:5}} onPress={()=>{updateCenter("active")}}>
                      <Text style={{color:global.white}}>ACCEPT</Text>
                    </TouchableOpacity>
                    
                    
                    {selectedPartner.status == 'rejected'?null:
                    <TouchableOpacity style={{width:80, backgroundColor:global.white, height:40, justifyContent:'center', alignItems:'center', borderRadius:5, marginLeft:20, borderWidth:0.5, borderColor:global.text}} onPress={()=>{updateCenter("rejected")}}>
                      <Text style={{color:global.text}}>Reject</Text>
                    </TouchableOpacity>
                    }
                </View>
                }
              </View>
              

              
              <TouchableOpacity style={{paddingRight:20, height:'100%', justifyContent:'center', paddingLeft:20}}  onPress={()=>{onCloseCenter()}}>
                 <FontAwesome5 name={'times'} light style={{fontSize:25, color:global.black}}/>
              </TouchableOpacity>
            </View>

               <View style={{width:'90%', height:110, backgroundColor:global.white, marginLeft:'5%', marginTop:20, borderRadius:10, padding:10, flexDirection:'row', justifyContent:'space-between'}}>
          
                <View>
                  <Text style={{color:global.black, fontSize:12, color:global.primary}}>{selectedPartner.name}</Text>

                  <Text style={{color:global.black, fontSize:11, marginTop:5}}>{selectedPartner.address}</Text>
                  <Text style={{color:global.black, fontSize:11}}>{selectedPartner.addressCont}</Text>
                 
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Text style={{color:global.black, fontSize:11}}>{selectedPartner.city}</Text>
                    <Text style={{color:global.black, fontSize:11}}>{selectedPartner.state}</Text>
                  </View>
                  <Text style={{color:global.black, fontSize:11}}>{selectedPartner.pin}</Text>
                </View>

                <View style={{alignItems:'flex-end'}}>
                  <Text style={{color:global.black, fontSize:9, marginBottom:10}}>{selectedPartner.email}</Text>
                  {phoneNumber(selectedPartner.phone)}
                </View>
              </View>

              <View style={{marginLeft:'5%',padding:10}}>
                <Text style={{fontSize:10, color:global.primary}}>{selectedPartner.proofType.toUpperCase()}</Text>
                <TouchableOpacity style={{alignItems:'center', backgroundColor:'white', borderRadius:5, justifyContent:'center', height:80, width:80, borderStyle: 'dashed', borderWidth:1, borderColor:global.info, marginTop:5}} onPress={()=>{onCloseCenter(); setImagePreview(true)}}>
                   <Image
                      style={{height:80,width:80, borderRadius:5}}
                      source={{uri:selectedPartner.proof}}
                    />
                </TouchableOpacity>
              </View>

              <View style={{marginLeft:'5%',padding:10}}>
                <Text style={{fontSize:10, color:global.primary}}>BANK DETAILS</Text>
                <Text style={{fontSize:10, color:global.text, marginTop:5}}>Bank: {selectedPartner.bankName.toUpperCase()}</Text>
                <Text style={{fontSize:10, color:global.text}}>Account number: {selectedPartner.accountNumber}</Text>
                <Text style={{fontSize:10, color:global.text}}>Ifsc code: {selectedPartner.ifsc}</Text>
                <Text style={{fontSize:10, color:global.text}}>UPI ID: {selectedPartner.upi}</Text>
              </View>


        </View>
      :null
      }

        
      </Modalize>



      {imagePreview?
        <View style={{flex:1, position:'absolute', top:0, backgroundColor:global.black, height:'100%', width:'100%'}}>
          
          <TouchableOpacity style={{position:'absolute',top:0, right:10, padding:15, zIndex:10}} onPress={()=>{setImagePreview(false)}}>
            <FontAwesome5 name={'times'} light style={{fontSize:25, color:global.white}}/>
          </TouchableOpacity>

          <Image
            resizeMode="contain"
            style={{height:'100%',width:'100%', borderRadius:5}}
            source={{uri:selectedPartner.proof}}
          />
       
        </View>
        :null
      }


      <Modal
        animationType="slide"
        transparent={true}
        visible={actionModal}
        onRequestClose={() => {
          setActionModal(false)
        }}>
        
        <View style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>

          <View style={{position:'absolute', backgroundColor:'black', flex:1, height:'100%', width:'100%', opacity:0.5, zIndex:0}}>

          </View>
          
          <View style={{width:windowWidth-100, height:300, backgroundColor:global.background, borderRadius:10, justifyContent:'center', alignItems:'center'}}>
              
              <TouchableOpacity style={{position:'absolute', right:0,top:0, height:40, width:40,  justifyContent:'center', alignItems:'center'}} onPress={()=>{setActionModal(false)}}>
                <FontAwesome5 name={'times'} light style={{fontSize:20, marginLeft:5,color:global.text}}/>
              </TouchableOpacity>

            <Text style={{marginLeft:'5%', marginRight:'5%',color:global.text}}>
              Accept the partner request to make the partner clinic or hospital to be visible to all users
            </Text>

            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
              <TouchableOpacity style={{alignItems:'center', justifyContent:'center', height:50, width:'40%', backgroundColor:global.success, borderRadius:5, marginTop:20}} onPress={()=>{updateCenter("active")}}>
                <Text style={{color:global.white, fontSize:16}}>ACCEPT</Text>
              </TouchableOpacity>
              
              {selectedPartner.status == "rejected"?null:
              <TouchableOpacity style={{alignItems:'center', justifyContent:'center', height:50, width:'40%', marginLeft:'5%', borderRadius:5, marginTop:20, borderWidth:1, borderColor:global.text, borderRadius:5}} onPress={()=>{updateCenter("rejected")}}>
                <Text style={{color:global.black, fontSize:16}}>REJECT</Text>
              </TouchableOpacity>
              }
            </View>
              
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

export default CenterRequested;
