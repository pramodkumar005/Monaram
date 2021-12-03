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

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


const Dashboard = () => {
  const [home, setHome] = useState(true);
  const [center, setCenter] = useState(false);
  const [order, setOrder] = useState(false);
  const [support, setSupport] = useState(false);
  const [infoData, setInfoData] = useState({});
  const [planData, setPlanData] = useState({});
  const [myPlanData, setMyPlanData] = useState({});

  const planPopUpContent = useRef<Modalize>(null);
  const infoPopUpContent = useRef<Modalize>(null);
  const myPlanPopupContent = useRef<Modalize>(null);

  useEffect(()=>{
   
  })


 


  const selectMenu=(value)=>{
    switch(value){
      case "home":{
        setHome(true);
        setCenter(false);
        setOrder(false);
        setSupport(false);
        break;
      }

      case "center":{
        setHome(false);
        setCenter(true);
        setOrder(false);
        setSupport(false);
        break;
      }

      case "order":{
        setHome(false);
        setCenter(false);
        setOrder(true);
        setSupport(false);
        break;
      }

      case "support":{
        setHome(false);
        setCenter(false);
        setOrder(false);
        setSupport(true);
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
      var eachElement = <Text style={{color:global.black}}>{planData.benefits[i].label}: {planData.benefits[i].value}</Text>
      array.push(eachElement);
    }

    return array;
  }




  
  return (
    <View style={{flex:1}}>
      {home?<Landing infoPopUp={infoPopUp} planPopup={planPopup}  myPlanPopup={myPlanPopup} />:null}
      {center?<Centers/>:null}
      {order?<Order/>:null}
      {support?<Support/>:null}


    {global.isUserLoggedIn?
      
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

      <TouchableOpacity style={{height:50, width:50, justifyContent:'center', alignItems:'center'}} onPress={()=>{selectMenu("order")}}>
        <View style={{backgroundColor: order? global.secondaryLight:null, height:35, width:35, justifyContent:'center', alignItems:'center', borderRadius:10}}>
          <FontAwesome5 name={'box'} solid style={{fontSize:15, color:global.primary}}/>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={{height:50, width:50, justifyContent:'center', alignItems:'center'}} onPress={()=>{selectMenu("support")}}>
        <View style={{backgroundColor: support? global.secondaryLight:null, height:35, width:35, justifyContent:'center', alignItems:'center', borderRadius:10}}>
          <FontAwesome5 name={'user-headset'} solid style={{fontSize:15, color:global.primary}}/>
        </View>
      </TouchableOpacity>

    </View>
    :
    null
    }


    <Modalize 
      ref={infoPopUpContent}
      modalHeight={windowHeight-100}>

      {infoData.hasOwnProperty("title")?
        <View>
            <View style={{flexDirection:'row', justifyContent:'space-between', height:50, alignItems:'center'}}>

              <View style={{paddingLeft:20}}>
                 <Text style={{fontWeight:"bold", fontSize:16, color:global.black}}>{infoData.title.toUpperCase()}</Text>
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
            <Text style={{fontSize:14, color:global.black}}>{infoData.description}</Text>
          </View>

        </View>
        :null
      }

    </Modalize>


    <Modalize 
      ref={planPopUpContent}
      modalHeight={windowHeight-100}
      FooterComponent={()=>{return(<View style={{width:'100%', height:50}}>
          <TouchableOpacity style={{width:'100%', height:60, backgroundColor:global.primary, justifyContent:'center', alignItems:'center'}} onPress={()=>{ onCloseInfo(); Actions.buyplan({selectedData: planData})}}>
            <Text style={{color:global.white, fontWeight:'bold', fontSize:16}}>BUY NOW</Text>
          </TouchableOpacity>
        </View>)}}
      >
        <View>
            <View style={{flexDirection:'row', justifyContent:'space-between', height:50, alignItems:'center'}}>

              <View style={{paddingLeft:20}}>
                 <Text style={{fontWeight:"bold", fontSize:16, color:global.black}}>{planData.name}</Text>
                 <Text style={{fontSize:12, color:global.black}}>{planData.smallIntro}</Text>
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
              <Text style={{fontSize:14, color:global.black}}>asdasd{planData.description}</Text>
            </View>

            <View style={{marginLeft:20, marginTop:50, paddingBottom:30}}>
              <Text style={{marginBottom:5, fontWeight:'bold', color:global.black}}>BENEFITS</Text>
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
      FooterComponent={()=>{return(<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20}}><View><Text>VALIDITY TILL</Text><Text  style={{color:global.primary}}>{myPlanData.validity}</Text></View><View><Text>BALANCE</Text><Text style={{color:global.primary}}>₹ {myPlanData.hasOwnProperty("policyNumber")?myPlanData.plan.balance:null}</Text></View></View>) }}
      >
        {myPlanData.hasOwnProperty("policyNumber")?
        <View style={{justifyContent:'center'}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', height:50, alignItems:'center'}}>

              <View style={{paddingLeft:20}}>
                 <Text style={{fontWeight:"bold", fontSize:16, color:global.black}}></Text>
              </View>

              <View style={{paddingLeft:20}}>
                 <Text style={{fontWeight:"bold", fontSize:16, color:global.black}}>{myPlanData.plan.name}</Text>
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
            </View>

            <View style={{width:windowWidth, alignItems:'center', marginTop:50}}>
              <View style={{alignItems:'center', justifyContent:'space-between', flexDirection:'row', width:windowWidth-50, padding:10, borderRadius:10, backgroundColor:global.border}}>
                <View style={{alignItems:'center', justifyContent:'center', width:'30%', borderRadius:20}}>
                  <View style={{height:80,width:80, borderColor:global.white, borderRadius:15, borderWidth:5, justifyContent:'center', alignItems:'center', backgroundColor:global.white}}>
                    <Image
                      resizeMode="contain"
                      style={{height:70,width:70,  borderColor:global.white, borderRadius:15}}
                      source={require('../assets/user.png')}
                    />
                  </View>
                </View>

                <View style={{width:'70%', paddingLeft:20}}>
                  <Text style={{fontSize:16, fontWeight:'bold', color:global.black}}>{myPlanData.fullName}</Text>
                  <Text style={{marginTop:10, color:global.black}}>{myPlanData.address}</Text>
                  <Text style={{color:global.black}}>{myPlanData.addressCont}</Text>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Text style={{color:global.black}}>{myPlanData.city}, </Text>
                    <Text style={{color:global.black}}>{myPlanData.state}</Text>
                  </View>
                  <Text style={{color:global.black}}>{myPlanData.pin}</Text>
                  <Text style={{marginTop:5, color:global.black}}>{myPlanData.phone}</Text>
                </View>
              </View>
            </View>


        </View>
        :null
      }

        

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

export default Dashboard;
