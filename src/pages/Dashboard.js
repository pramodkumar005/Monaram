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
  FlatList
} from 'react-native';


import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';

import Info from '../components/Info';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';
import { Modalize } from 'react-native-modalize';

import Landing from '../components/Landing';
import Centers from '../components/Centers';
import Order from '../components/Order';
import Support from '../components/Support';
import Claims from '../components/Claims';


import auth from '@react-native-firebase/auth';
var currentUser = auth().currentUser;

import firestore from '@react-native-firebase/firestore';
const db = firestore()

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


const Dashboard = (props) => {
  const [home, setHome] = useState(true);
  const [center, setCenter] = useState(false);
  const [order, setOrder] = useState(false);
  const [support, setSupport] = useState(false);
  const [claims, setClaims] = useState(false);
  const [infoData, setInfoData] = useState({});
  const [planData, setPlanData] = useState({});
  const [myPlanData, setMyPlanData] = useState({});

  const [initiatedLabel, setInitiatedLabel] = useState(false);

  const [selectedImage, setSelectedImage] = useState("");
  const [imagePreview, setImagePreview] = useState(false);

  const planPopUpContent = useRef<Modalize>(null);
  const infoPopUpContent = useRef<Modalize>(null);
  const myPlanPopupContent = useRef<Modalize>(null);

  const [role, setRole] = useState(props.role);


  console.log('____________________________________'+global.role)
  console.log('____________________________________'+props.role)

  useEffect(()=>{
    currentUser = auth().currentUser;
    checkUserLoggedIn();
  })


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

 


  const selectMenu=(value)=>{
    switch(value){
      case "home":{
        setHome(true);
        setCenter(false);
        setOrder(false);
        setSupport(false);
        setClaims(false);
        break;
      }

      case "center":{
        setHome(false);
        setCenter(true);
        setOrder(false);
        setSupport(false);
        setClaims(false);
        break;
      }

      case "order":{
        setHome(false);
        setCenter(false);
        setOrder(true);
        setSupport(false);
        setClaims(false);
        break;
      }

      case "support":{
        setHome(false);
        setCenter(false);
        setOrder(false);
        setSupport(true);
        setClaims(false);
        break;
      }


      case "claims":{
        setHome(false);
        setCenter(false);
        setOrder(false);
        setSupport(false);
        setClaims(true);
        break;
      }

    }
  }


  const infoPopUp=(e)=>{
    console.log("helllooooooooooooooooo"+JSON.stringify(e.description))
    setInfoData(e,[onOpenInfo()]);
    
  }


  const planPopup=(e)=>{
    console.log("plans>>>>>>>>"+JSON.stringify(e))
    setPlanData(e,[onOpenPlan()])
  }


  const myPlanPopup=(e)=>{
    console.log("myplans>>>>>>>>"+JSON.stringify(e))
    setMyPlanData(e,[onOpenMyPlan()])
  }


  const myselectedImage=(e)=>{
    console.log("myselectedImage>>>>>>>>"+(e))
    setSelectedImage(e,[setImagePreview(true)])
  }


  const onOpenInfo = () => {
    infoPopUpContent.current?.open();
  };

  const onCloseInfo = () => {
    infoPopUpContent.current?.close();
  };

  const onOpenPlan = () => {
    planPopUpContent.current?.open();
  };

  const onClosePlan = () => {
    planPopUpContent.current?.close();
  };


  const onOpenMyPlan = () => {
    myPlanPopupContent.current?.open();
  };

  const onCloseMyPlan = () => {
    myPlanPopupContent.current?.close();
  };

  const benefits=()=>{
    var array = []
    for (var i = 0; i < planData.benefits.length; i++) {
      var eachElement = <Text style={{color:global.text}}>{planData.benefits[i].label}: {planData.benefits[i].value}</Text>
      array.push(eachElement);
    }

    return array;
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
          eachElement =  <Text style={{color:global.text, fontSize:10}}> ₹ {e[i].initiatedAmount}</Text>
          
        }else{
          eachElement =  <Text style={{color:global.text, fontSize:10}}>-</Text>
        }

        tempArray.push(eachElement)
       
      }
    }

    return tempArray;
  }




  
  return (
    <View style={{flex:1}}>
      {home?<Landing infoPopUp={infoPopUp} planPopup={planPopup}  myPlanPopup={myPlanPopup} userRole={role}/>:null}
      {center?<Centers userRole={role}/>:null}
      {order && global.isUserLoggedIn?<Order userRole={role}/>:null}
      {claims && global.isUserLoggedIn && (role == 'partner' || role == 'admin') ?<Claims myselectedImage={myselectedImage} userRole={role}/>:null}
      {support?<Support/>:null}


   
      
    <View style={{height:50, width:'100%', flexDirection:'row', backgroundColor:global.white, justifyContent:'space-around', alignItems:'center'}}>
      
      <TouchableOpacity style={{height:50, width:50, justifyContent:'center', alignItems:'center'}} onPress={()=>{selectMenu("home")}}>
        <View style={{backgroundColor: home? global.secondaryLight:null, height:35, width:35, justifyContent:'center', alignItems:'center', borderRadius:10}}>
          <FontAwesome5 name={'home-alt'} solid style={{fontSize:15, color:global.primary}}/>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={{height:50, width:50, justifyContent:'center', alignItems:'center'}} onPress={()=>{selectMenu("center")}}>
        <View style={{backgroundColor: center? global.secondaryLight:null, height:35, width:35, justifyContent:'center', alignItems:'center', borderRadius:10}}>
          <FontAwesome5 name={'hospital'} solid style={{fontSize:15, color:global.primary}}/>
        </View>
      </TouchableOpacity>

      {global.isUserLoggedIn && role =='partner'|| role == 'admin' ?
      <TouchableOpacity style={{height:50, width:50, justifyContent:'center', alignItems:'center'}} onPress={()=>{selectMenu("claims")}}>
        <View style={{backgroundColor: claims? global.secondaryLight:null, height:35, width:35, justifyContent:'center', alignItems:'center', borderRadius:10}}>
          <FontAwesome5 name={'shield-check'} solid style={{fontSize:15, color:global.primary}}/>
        </View>
      </TouchableOpacity>
      :null
      }

      {global.isUserLoggedIn ?
      <TouchableOpacity style={{height:50, width:50, justifyContent:'center', alignItems:'center'}} onPress={()=>{selectMenu("order")}}>
        <View style={{backgroundColor: order? global.secondaryLight:null, height:35, width:35, justifyContent:'center', alignItems:'center', borderRadius:10}}>
          <FontAwesome5 name={'box'} solid style={{fontSize:15, color:global.primary}}/>
        </View>
      </TouchableOpacity>
      :null
      }


      <TouchableOpacity style={{height:50, width:50, justifyContent:'center', alignItems:'center'}} onPress={()=>{selectMenu("support")}}>
        <View style={{backgroundColor: support? global.secondaryLight:null, height:35, width:35, justifyContent:'center', alignItems:'center', borderRadius:10}}>
          <FontAwesome5 name={'user-headset'} solid style={{fontSize:15, color:global.primary}}/>
        </View>
      </TouchableOpacity>

    </View>
    


    <Modalize 
      ref={infoPopUpContent}
      modalHeight={windowHeight-100}>

      {infoData.hasOwnProperty("title")?
        <View style={{paddingBottom:50}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', height:50, alignItems:'center'}}>

              <View style={{paddingLeft:20}}>
                 <Text style={{fontWeight:"bold", fontSize:16, color:global.primary}}>{infoData.title.toUpperCase()}</Text>
              </View>
              <TouchableOpacity style={{paddingRight:20, height:'100%', justifyContent:'center', paddingLeft:20}}  onPress={()=>{onCloseInfo()}}>
                 <FontAwesome5 name={'times'} light style={{fontSize:25, color:global.black}}/>
              </TouchableOpacity>
            </View>

            <View style={{width:'40%', marginTop:50}}>
            <Image
              resizeMode="contain"
              style={{height:200,width:200}}
              source={{uri:infoData.image}}
            />
          </View>

          <View style={{marginTop:50, paddingLeft:20, paddingRight:20}}>
            <Text style={{fontSize:14, color:global.text}}>{infoData.description}</Text>
          </View>

        </View>
        :null
      }

    </Modalize>


    <Modalize 
      ref={planPopUpContent}
      modalHeight={windowHeight-100}
      FooterComponent={()=>{return(<View style={{width:'100%', height:50}}>
          <TouchableOpacity style={{width:'100%', height:60, backgroundColor:global.primary, justifyContent:'center', alignItems:'center'}} onPress={()=>{ if(global.isUserLoggedIn == true){ onCloseInfo(); Actions.buyplan({selectedData: planData})} else{ Actions.login({lastPage: 'dashboard'})}  }}>
            <Text style={{color:global.white, fontWeight:'bold', fontSize:16}}>BUY NOW</Text>
          </TouchableOpacity>
        </View>)}}
      >
        <View>
            <View style={{flexDirection:'row', justifyContent:'space-between', height:50, alignItems:'center'}}>

              <View style={{paddingLeft:20}}>
                 <Text style={{fontWeight:"bold", fontSize:16, color:global.primary}}>{planData.name}</Text>
                 <Text style={{fontSize:12, color:global.text}}>{planData.smallIntro}</Text>
              </View>
              <TouchableOpacity style={{paddingRight:20, height:'100%', justifyContent:'center', paddingLeft:20}}  onPress={()=>{onClosePlan()}}>
                 <FontAwesome5 name={'times'} light style={{fontSize:25, color:global.black}}/>
              </TouchableOpacity>
            </View>

            <View style={{width:'100%', marginTop:50, flexDirection:'row'}}>
              <Image
                resizeMode="contain"
                style={{height:200,width:200}}
                source={{uri:planData.image}}
              />
              <View>
                <View style={{height:50, width:150, justifyContent:'center', alignItems:'center', padding:5, borderRadius:5 ,borderColor: global.primary, borderWidth:1}}>
                  <Text style={{color: global.primary, fontWeight:'bold', fontSize:18}}>₹ {planData.annualPremium} / Year</Text>
                  <Text style={{color: global.primary, fontSize:11}}>Annual Premium</Text>
                  
                </View>

                {/*<TouchableOpacity style={{height:50, width:150, justifyContent:'center', alignItems:'center', padding:5, backgroundColor: global.primary, marginTop:0, borderRadius:5, marginTop:5}} onPress={()=>{onCloseInfo(); Actions.buyplan({selectedData: planData})}}>
                  <Text style={{color: global.white, fontSize:16, fontWeight:'bold'}}>BUY NOW</Text>
                </TouchableOpacity>*/}
              </View>
            </View>

            <View style={{marginTop:50, paddingLeft:20, paddingRight:20}}>
              <Text style={{fontSize:12, color:global.text}}>asdasd{planData.description}</Text>
            </View>

            <View style={{marginLeft:20, marginTop:50, paddingBottom:30}}>
              <Text style={{marginBottom:5, fontWeight:'bold', color:global.secondary}}>BENEFITS</Text>
              { planData.hasOwnProperty("benefits")?
                benefits()
                :
                null
              }
            </View>
        </View>

        

    </Modalize>


    <Modalize 
      ref={myPlanPopupContent}
      modalHeight={windowHeight-40}
      FooterComponent={()=>{return(
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', padding:20}}>
            <View>
              <View>
                <Text style={{fontSize:12, color:global.info}}>VALIDITY TILL</Text>
                <Text  style={{color:global.text, fontSize:12}}>{myPlanData.validity}</Text>
              </View>
            </View>
            
          </View>
          )}}>
        {myPlanData.hasOwnProperty("policyNumber")?
        <View style={{justifyContent:'center'}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', height:30, alignItems:'center'}}>

              <View style={{paddingLeft:20}}>
                 <Text style={{fontWeight:"bold", fontSize:16, color:global.black}}></Text>
              </View>

              <View style={{paddingLeft:20}}>
                 <Text style={{fontWeight:"bold", fontSize:16, color:global.primary}}>{myPlanData.plan.name}</Text>
              </View>
              <TouchableOpacity style={{paddingRight:20, height:'100%', justifyContent:'center', paddingLeft:20}}  onPress={()=>{onCloseMyPlan()}}>
                 <FontAwesome5 name={'times'} light style={{fontSize:25, color:global.black}}/>
              </TouchableOpacity>
            </View>


            <View style={{width:windowWidth, height:250, alignItems:'center', marginTop:30}}>
              <Image
                resizeMode="contain"
                style={{height:250,width:250}}
                source={{uri:myPlanData.qrCode}}
              />
              <View style={{flexDirection:'row', alignItems:'center', marginTop:10}}>
                <Text style={{color:global.info, fontSize:11}}>Policy Number: </Text>
                <Text style={{color:global.text, fontSize:11}}>{myPlanData.policyNumber}</Text>
              </View>
            </View>

            <View style={{width:windowWidth, alignItems:'center', marginTop:50}}>
              <View style={{alignItems:'center', justifyContent:'space-between', flexDirection:'row', width:windowWidth-50, padding:10, borderRadius:10, backgroundColor:global.border}}>
                <View style={{alignItems:'center', justifyContent:'center', width:'30%', borderRadius:20}}>
                  <View style={{height:60,width:60, borderColor:global.white, borderRadius:15, borderWidth:5, justifyContent:'center', alignItems:'center', backgroundColor:global.white}}>
                    <Image
                      resizeMode="contain"
                      style={{height:50,width:50,  borderColor:global.white, borderRadius:15}}
                      source={require('../assets/user.png')}
                    />
                  </View>
                </View>

                <View style={{width:'70%', paddingLeft:20}}>
                  <Text style={{fontSize:11, fontWeight:'bold', color:global.black}}>{myPlanData.fullName}</Text>
                  <Text style={{marginTop:5, color:global.black, fontSize:11}}>{myPlanData.address}</Text>
                  <Text style={{color:global.black, fontSize:11}}>{myPlanData.addressCont}</Text>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Text style={{color:global.black, fontSize:11}}>{myPlanData.city}, </Text>
                    <Text style={{color:global.black, fontSize:11}}>{myPlanData.state}</Text>
                  </View>
                  <Text style={{color:global.black, fontSize:11}}>{myPlanData.pin}</Text>
                  <Text style={{marginTop:5, color:global.black, fontSize:11}}>{myPlanData.phone}</Text>
                  {myPlanData.hasOwnProperty('email')?
                    <Text style={{marginTop:0, color:global.black, fontSize:10}}>{myPlanData.email}</Text>
                    : null
                  }
                </View>
              </View>


              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', width:'90%', marginTop:30}}>
                <View>
                  <View>
                    <Text style={{fontSize:11, color:global.info, marginBottom:5}}>BALANCE</Text>
                  
                    {
                      benefitAmount(myPlanData.plan.benefitAmount)
                    }
                  </View>
                </View>
                <View style={{alignItems:'flex-end'}}>
                  {myPlanData.hasOwnProperty("policyNumber")?
                  <View style={{alignItems:'flex-end'}}>
                    <Text style={{fontSize:11, color:global.info, marginBottom:5}}>INITIATED AMOUNT</Text>
                    {
                     benefitInitiatedAmount(myPlanData.plan.benefitAmount)
                    }
                  </View>
                  :null
                  }
                </View>
              </View>
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

export default Dashboard;
