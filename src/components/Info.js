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
import SplashScreen from 'react-native-splash-screen';

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const db = firestore()
var currentUser = auth().currentUser;



const Info = ({elementInfoPressed}) => {
const [infos, setInfos] = useState([])
 
  useEffect(()=>{
    getInfo();
  },[])


  const getInfo=()=>{
    db.collection("info").get()
    .then((querySnapshot) => {

      var tempArray = []
      querySnapshot.forEach((doc) => {

           var eachElement =  doc.data()
           console.log(doc.data())
           tempArray.push(eachElement)
        })

      setInfos(tempArray);
      global.infos = tempArray;
      SplashScreen.hide();
      
    })
    .catch((error) => {
      SplashScreen.hide();
      console.error("Error writing document: ", error);
    });

    
  }


  const onClickInfo=(e)=>{
    console.log(e.title)
  }


   const renderItem = ({item}) => {

      if(infos.length !==0){

        return(
 
       <TouchableOpacity  style={{width:windowWidth, height:140}} onPress={()=>{elementInfoPressed(item)}}>
        <View style={{margin:10, backgroundColor:global.white, borderRadius:10, height:120, padding:15, justifyContent:'center', flexDirection:'row', marginLeft:20, marginRight:20}}>
          
          <View style={{width:'40%', height:'100%'}}>
            <Image
              resizeMode="contain"
              style={{height:'100%',width:'100%'}}
              source={{uri:item.image}}
            />
          </View>

          <View style={{justifyContent:'space-between', height:'100%', width:'60%'}}>
            <View>
              <Text style={{fontWeight:'bold', color:global.primary}}>{item.title.toUpperCase()}</Text>
              <Text ellipsizeMode='tail' numberOfLines={4} style={{fontSize:12, marginTop:2, color:global.text}}>{item.description}</Text>
            </View>
          </View>

        </View>
      </TouchableOpacity>

      )}


    };
  
  return (
    <View style={{flex:1}}>
       <Text style={{marginLeft:20, fontSize:12, marginBottom:5, color:global.text}}>WHY CHOOSE HEALTH INSURANCE ?</Text>
       <FlatList
        data={infos}
        renderItem={(item)=>renderItem(item)}
        showsVerticalScrollIndicator={false}
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

export default Info;
