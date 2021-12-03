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
import Carousel from 'react-native-snap-carousel';
import moment from 'moment';
import RNQRGenerator from 'rn-qr-generator';

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const db = firestore()
var currentUser = auth().currentUser;



const MyPlans = ({elementMyPlanPressed, plansPresent, userRole}) => {
const [myPlans, setMyPlans] = useState([])

const refCarousel = useRef<Modalize>(null);

const [reRender, setReRender] = useState(false);
const [role, setRole] = useState(userRole);

console.log('My plan >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+userRole)
 
  useEffect(()=>{

    getMyPlans()
    
  },[])



   


  const getMyPlans=()=>{
    console.log('fetching my plans>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+role)
    var query;
        // if(role=='admin'){
        //   query = db.collection("orders")
        // }else{
          query = db.collection("orders").where('uid', '==', global.userData.uid)
        // }
    query.get()
    .then((querySnapshot) => {

      var tempArray = []
      querySnapshot.forEach((doc) => {
           console.log('doc.data()>>>>>>>>>>>>>'+doc.data().fullName)
           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })
        global.myPlan = tempArray;
        setMyPlans(tempArray);

        console.log('tempArraytempArraytempArraytempArraytempArraytempArraytempArray'+tempArray.length)

        if(tempArray.length>0){
          plansPresent(true)
        }else{
          plansPresent(false)
        }
    })
  }


  const onPressOfPlan=(e)=>{
    console.log(e)
    elementMyPlanPressed(e);
  }

   const _renderItem = ({ item, index }) => {
      console.log('myPlans.length>>>>>>>>>>>>>'+myPlans.length)
        return (
            <TouchableOpacity style={{
              backgroundColor:'white',
              borderRadius: 10,
              borderWidth:1,
              borderColor:global.border,
              height: 100,
              width:windowWidth-40,
              padding: 10, elevation:3 }} onPress={()=>{onPressOfPlan(item)}}>
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <View  style={{width:'70%'}}>
                  <Text style={{fontSize: 14, color:global.black, fontWeight:'bold'}}>{item.plan.name}</Text>
                  {moment(item.validity,"DD-MM-YYYY").diff(moment(), 'days' ) >=0?
                    <View style={{width:40, height:15, backgroundColor:global.white, alignItems:'center', justifyContent:'center', borderRadius:5, borderWidth:1, borderColor:global.success, marginTop:5}}>
                      <Text style={{fontSize:8, color:global.success, fontWeight:'bold'}}>ACTIVE</Text>
                     </View>
                    :
                    <View style={{width:40, height:15, backgroundColor:global.white, alignItems:'center', justifyContent:'center', borderRadius:5, borderWidth:1, borderColor:global.black, marginTop:5}}>
                      <Text style={{fontSize:8, color:global.black, fontWeight:'bold'}}>EXPIRED</Text>
                     </View>
                  }

                  <View style={{marginTop:15, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                    <View style={{width:50, height:25, backgroundColor:global.white, alignItems:'center', justifyContent:'center', borderRadius:5, borderWidth:1, borderColor:global.info}}>
                      <Text style={{fontSize:9, color:global.info, fontWeight:'bold'}}>DETAILS</Text>
                    </View>
                    {moment(item.validity,"DD-MM-YYYY").diff(moment(), 'days' ) >=0?
                      <Text style={{fontSize: 10, color:global.info, marginRight:5}}>{ moment(item.validity,"DD-MM-YYYY").diff(moment(), 'days' ) } DAYS LEFT</Text>
                      :null
                    }
                    
                  </View>
                </View>

                <View style={{width:'30%', alignItems:'center', borderLeftWidth:1, height:'100%', justifyContent:'center', borderColor:global.border}}>
                  <Image
                      resizeMode="contain"
                      style={{height:50,width:50}}
                      source={{uri:item.plan.logo}}
                    />
                </View>
            </View>
          </TouchableOpacity>
        );
    }
   
  
  return (
    <View style={{height:180, width:'100%', justifyContent:'center', padding:5}}>
      <View>
        <Text style={{marginLeft:15, color:global.text, fontSize:12, marginBottom:5}}>MY PLANS</Text>
        <Carousel
          layout={'tinder'}
          ref={refCarousel}
          data={myPlans}
          renderItem={({ item, index })=>_renderItem({ item, index })}
          sliderWidth={windowWidth}
          itemWidth={(windowWidth-20)}
          containerCustomStyle={{}}
          inactiveSlideShift={0}
          onSnapToItem={(index) => {}}
          layoutCardOffset={'9'}
          useScrollView={true}  
          contentContainerCustomStyle={{height:110}}
        />
      </View>
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

export default MyPlans;
