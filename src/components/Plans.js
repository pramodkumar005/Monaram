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
  FlatList,
  Alert
} from 'react-native';


import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';
import moment from 'moment';


const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const db = firestore()
var currentUser = auth().currentUser;



const Plans = ({elementPlanPressed, userRole}) => {
const [plans, setPlans] = useState([])
const [myPlans, setMyPlans] = useState([])
const [role, setRole] = useState(userRole);
 
  useEffect(()=>{
      getPlans();
  },[])


  const getMyPlans=(allPlans)=>{

    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$:::::::'+JSON.stringify(currentUser))

     if (currentUser !==null) {
        console.log('fetching my plans>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+global.userData.uid)
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
            setMyPlans(tempArray,[updatePlansForMyPlansData(allPlans, tempArray)]);

            console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR')
            
            
        })
     }
  }


  const updatePlansForMyPlansData=(allPlans, myFetchedPlans)=>{
   
        var tempPlan = allPlans
        
        for (var i = 0; i < tempPlan.length; i++) {
          var index = myFetchedPlans.findIndex(x=> x.planId == tempPlan.planId && moment(x.validity,"DD-MM-YYYY") > moment() )
          if(index !== -1){
            console.log("This plan has been bought>>>>>>>>>>>>>>>>>"+index)
            
            tempPlan[i]["isPlanPurchased"] = true

          }
        }
        setPlans(tempPlan);
        console.log('tempArraytempArraytempArraytempArraytempArraytempArraytempArray'+JSON.stringify(tempPlan));
    
  }


  const getPlans=()=>{
    db.collection("plans").orderBy('orderBy', 'asc').get()
    .then((querySnapshot) => {

      var tempArray = []
      querySnapshot.forEach((doc) => {

           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })

      setPlans(tempArray,[getMyPlans(tempArray)]);

      global.plans = tempArray;

    })
  }


  const purcahsedAlert = () =>
    Alert.alert(
      "Plans",
      "You have already purchased this plan.",
      [
        
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ]
    );


   const renderItem = ({ item }) => (
    <View>
      {item.status? 
      <TouchableOpacity style={{width:windowWidth-(windowWidth*0.10), height:140}} onPress={()=>{if(item.isPlanPurchased){purcahsedAlert()}else{elementPlanPressed(item)} }}>
        <View style={{margin:10, backgroundColor:item.backColor, borderRadius:10, height:120, padding:15, justifyContent:'center', flexDirection:'row', borderWidth:0.5, borderColor:global.info}}>
          
          <View style={{justifyContent:'space-between', height:'100%', width:'60%'}}>
            <View>
              <Text style={{fontWeight:'bold', color:global.black}}>{item.name.toUpperCase()}</Text>
              <Text style={{fontSize:12, marginTop:2, color:global.black}}>{item.smallIntro}</Text>
            </View>
            { item.isPlanPurchased?
              <View style={{height:30, borderRadius:5, flexDirection:'row', alignItems:'center'}}>
                  <FontAwesome5 name={'check-circle'} solid style={{fontSize:15, marginRight:5, color:global.success}}/>
                  <Text style={{fontWeight:'bold', color:global.success, fontSize:14}}>Already purchased</Text>
              </View>
              :
              <View style={{justifyContent:'center', alignItems:'center', backgroundColor:global.primary, width:70, height:30, borderRadius:5}}>
                  <Text style={{fontWeight:'bold', color:global.white}}>BUY</Text>
              </View>
            }
          </View>

          <View style={{width:'40%', height:'100%'}}>
            <Image
              resizeMode="contain"
              style={{height:'100%',width:'100%'}}
              source={{uri:item.image}}
            />
          </View>
        </View>
      </TouchableOpacity>
      :
      <View style={{width:windowWidth-(windowWidth*0.10), height:140}}>
        <View style={{margin:10, backgroundColor:item.backColor, borderRadius:10, height:120, padding:15, justifyContent:'center', flexDirection:'row', borderWidth:0.5, borderColor:global.info}}>
          
          <View style={{justifyContent:'space-between', height:'100%', width:'60%'}}>
            <View>
              <Text style={{fontWeight:'bold', color:global.black}}>{item.name.toUpperCase()}</Text>
              <Text style={{fontSize:12, marginTop:2, color:global.black}}>{item.smallIntro}</Text>
            </View>
            <View style={{justifyContent:'center', alignItems:'center', backgroundColor:global.primary, width:110, height:30, borderRadius:5}}>
              <Text style={{fontWeight:'bold', color:global.white}}>COMING SOON</Text>
            </View>
          </View>

          <View style={{width:'40%', height:'100%'}}>
            <Image
              resizeMode="contain"
              style={{height:'100%',width:'100%'}}
              source={{uri:item.image}}
            />
          </View>
        </View>
      </View>

      }
    </View>
    );
  
  return (
    <View style={{flex:1}}>
       <Text style={{marginLeft:15, color:global.text, fontSize:12, marginBottom:5}}>EXPLORE PLANS</Text>
       <FlatList
        data={plans}
        renderItem={renderItem}
        horizontal ={true}
        showsHorizontalScrollIndicator={false}
      />
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

export default Plans;
