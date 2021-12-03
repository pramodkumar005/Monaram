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
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';


import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';
import Plans from '../components/Plans';
import Info from '../components/Info';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';

import { Modalize } from 'react-native-modalize';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
const db = firestore()
var currentUser = auth().currentUser;

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


const Centers = ({userRole}) => {

  const [role, setRole] = useState(userRole);
  const [centerList, setCenterList] = useState([]);
  const [rerender, setRerender] = useState(true);
  const [formattedList, setFormattedList] = useState([])

  const [lastVisibleCenters,setLastVisibleCenters] = useState();
  const [centerPagination,setCenterPagination] = useState(true);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const [selectedPartner, setSelectedPartner] = useState({});


  const partnerActions = useRef<Modalize>(null);

  console.log('fetching partner list>>>>>>role>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+role)

  useEffect(()=>{
    getPatnerList();
    currentUser = auth().currentUser;
  },[])

   const getPatnerList=()=>{
    setRefreshing(true)
    console.log('fetching partner list>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    db.collection("partners")
    .where('status', '==', 'active')
    .orderBy('city', 'asc')
    .limit(global.pagination)
    .get()
    .then((querySnapshot) => {
      var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
      setLastVisibleCenters(lastVisible)

      setCenterPagination(true)

      var tempArray = []
      querySnapshot.forEach((doc) => {

           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })

      
        global.partnerList = tempArray;
        // console.log('doc.data()>>>>>>>>>>>>>'+JSON.stringify(tempArray))
        setCenterList(tempArray,[setData(tempArray)])
        setRefreshing(false)
    })
  }


  const onOpenMyPlan = () => {
    partnerActions.current?.open();
  };

  const onCloseMyPlan = () => {
    partnerActions.current?.close();
  };


  const getNextPatnerList=()=>{
    if (centerPagination) {
      setLoading(true)
      console.log('fetching next partner list>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
      db.collection("partners")
      .where('status', '==', 'active')
      .orderBy('city', 'asc')
      .startAfter(lastVisibleCenters)
      .limit(global.pagination)
      .get()
      .then((querySnapshot) => {

        var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
        setLastVisibleCenters(lastVisible)

        var tempArray = []
        tempArray = centerList ;
        querySnapshot.forEach((doc) => {

             var eachElement =  doc.data()
             tempArray.push(eachElement)
          })
          global.partnerList = tempArray;
          // console.log('doc.data()>>>>>>>>>>>>>'+JSON.stringify(tempArray))
          console.log('+++++++++++++++++++++++++'+querySnapshot.docs.length+':::::::::'+ global.pagination)

          if(querySnapshot.docs.length < global.pagination){
            console.log('tempArray.lengthtempArray.lengthtempArray.lengthtempArray.length:::'+tempArray.length)

            setCenterPagination(false)
          }

          setCenterList([...tempArray],[setData(tempArray)])

      })
    }
  }

  const setData=(recievedData)=>{
    console.log('formatting partner list>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    var tempArray = []
    for (var i = 0; i < recievedData.length; i++) {
      // console.log('element is not present'+JSON.stringify(tempArray))
      var index =  tempArray.findIndex(x=>x.title == recievedData[i].city);
      var eachElement ={};

      if(index == -1){
        var array = []
        array.push(recievedData[i])
        eachElement = {title: recievedData[i].city, data:array}
        tempArray.push(eachElement)
        // console.log('element is not present')
      }else{
        tempArray[index].data.push(recievedData[i])
        // console.log('element is  present')
      }
      
    }

    // console.log(JSON.stringify(tempArray))
    setFormattedList(tempArray,[setLoading(false)])
    
  }


  const phoneNumber=(phone)=>{
    var tempArray = []
    for (var i = 0; i <phone.length; i++) {
      var eachElement = <Text style={{color:global.black, fontSize:9}}>{phone[i]} </Text>
      tempArray.push(eachElement);
    }

    return tempArray;
  }


  const deactivateAlert = () =>
    Alert.alert(
      "DELETE",
      "Are you sure want to deactivate this partner ?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => deactivatePartner() }
      ]
    );



    const deactivatePartner=()=>{
       db.collection("partners").doc(selectedPartner.partnerId).set({status:'deactivated'},{merge:true})
      .then((response) => {
        getPatnerList()
        onCloseMyPlan()
      })
      .catch((error) => {
          console.error("Error writing document: ", error);
          setProcessing(false)
      });
    }



  const Item = ( item ) =>{

    if(role=='admin'){
      return(
        <TouchableOpacity style={{width:'90%', height:110, backgroundColor:global.white, marginLeft:'5%', marginBottom:20, borderRadius:10, padding:10, flexDirection:'row', justifyContent:'space-between'}} onPress={()=>{setSelectedPartner(item, [onOpenMyPlan()]) }}>
          
          <View>
            <Text style={{color:global.black, fontSize:14, color:global.primary}}>{item.name}</Text>

            <Text style={{color:global.black, fontSize:11, marginTop:5}}>{item.address}</Text>
            <Text style={{color:global.black, fontSize:11}}>{item.addressCont}</Text>
           
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Text style={{color:global.black, fontSize:11}}>{item.city}</Text>
              <Text style={{color:global.black, fontSize:11}}>{item.state}</Text>
            </View>
            <Text style={{color:global.black, fontSize:11}}>{item.pin}</Text>
          </View>

          <View style={{alignItems:'flex-end'}}>
            <Text style={{color:global.black, fontSize:11, marginBottom:10, fontSize:9}}>{item.email}</Text>
            {phoneNumber(item.phone)}
          </View>
        </TouchableOpacity>
        )
    }else{
      return(
          <View style={{width:'90%', height:110, backgroundColor:global.white, marginLeft:'5%', marginBottom:20, borderRadius:10, padding:10, flexDirection:'row', justifyContent:'space-between'}}>
            
            <View>
              <Text style={{color:global.black, fontSize:14, color:global.primary}}>{item.name}</Text>

              <Text style={{color:global.black, fontSize:11, marginTop:5}}>{item.address}</Text>
              <Text style={{color:global.black, fontSize:11}}>{item.addressCont}</Text>
             
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Text style={{color:global.black, fontSize:11}}>{item.city}</Text>
                <Text style={{color:global.black, fontSize:11}}>{item.state}</Text>
              </View>
              <Text style={{color:global.black, fontSize:11}}>{item.pin}</Text>
            </View>

            <View style={{alignItems:'flex-end'}}>
              <Text style={{color:global.black, fontSize:11, marginBottom:10, fontSize:9}}>{item.email}</Text>
              {phoneNumber(item.phone)}
            </View>
          </View>
          )
        }
    };

  
  return (
    <View style={{flex:1, backgroundColor:global.background}}>
    <View style={{flexDirection:'row', justifyContent:'space-between', paddingLeft:10, paddingRight:10, height:50, alignItems:'center', marginTop:10}}>
          
           <View style={{flexDirection:'row', alignItems:'center', paddingLeft:10, height:50}}>
            <Text style={{color:global.info}}>CLINIC AND HOSPITALS</Text>
          </View>

          {role == "user" ?
          <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={()=>{currentUser ==null?Actions.login({lastPage:'becomepartner'}) : Actions.becomepartner()}}>
            <Image
              style={{width:100}}
              resizeMode="contain"
              source={require('../assets/sticker.png')}
            />
          </TouchableOpacity>
          :
          <View>
            {role == "admin" ?
              <View style={{justifyContent:'center', alignItems:'center'}}>
                <TouchableOpacity style={{width:70, height:30, backgroundColor:global.primary, borderRadius:5,justifyContent:'center', alignItems:'center'}} onPress={()=>{Actions.centerrequested()}}>
                  <Text style={{color:global.white, fontWeight:'bold', fontSize:11}}>Requested</Text>
                </TouchableOpacity> 
              </View>
              :
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Image
                  style={{height:18,width:18}}
                  source={require('../assets/logoGrey.png')}
                />
                <Text style={{fontSize:18, fontWeight:'bold', paddingLeft:5, color:global.info}}>Monaram</Text>
              </View>
            }
          </View>
          
          }

      </View>
    <View  style={{flexGrow:1, backgroundColor:global.background, paddingBottom:50}}>
      <SectionList
          sections={formattedList}
          keyExtractor={(item, index) => item + index}
          renderItem={({item}) => Item(item) }
          renderSectionHeader={({ section: { title } }) => (
            <View style={{marginLeft:'5%', height:40, justifyContent:'center', borderBottomWidth:0.5, marginRight:'5%', marginBottom:20, borderColor:global.info}}>
              <Text style={{fontSize:14, color:global.info}}>{title.toUpperCase()}</Text>
            </View>
          )}

          refreshControl={<RefreshControl
                refreshing={refreshing}
                onRefresh={()=>{getPatnerList()}}
              />
          }
          onEndReached={()=>{getNextPatnerList()}}
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
        />
    </View>


    <Modalize 
        ref={partnerActions}
        modalHeight={230}
        >

        <View style={{justifyContent:'center'}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', height:50, alignItems:'center', marginTop:10, borderBottomWidth:1, borderColor:global.border, paddingBottom:10}}>

              <Text style={{paddingLeft:20, color:global.primary}}>{selectedPartner.name}</Text>

              <TouchableOpacity style={{paddingRight:20, height:'100%', justifyContent:'center', paddingLeft:20}}  onPress={()=>{onCloseMyPlan()}}>
                 <FontAwesome5 name={'times'} light style={{fontSize:25, color:global.black}}/>
              </TouchableOpacity>
            </View>
        </View>

        <Text style={{paddingLeft:20, paddingRight:20, marginTop:10}}>You can edit or deactivate the partner. Deactivated this partner then it will not be visible to other users</Text>

        <View style={{justifyContent:'center', marginTop:30}}>
          <View style={{justifyContent:'center', flexDirection:'row'}}>
            <TouchableOpacity style={{height:50, width:100, justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:global.info, borderRadius:5}} onPress={()=>{deactivateAlert()}}>
              <Text style={{color:global.text}}>DEACTIVATE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{height:50, width:100, justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:global.info, borderRadius:5, marginLeft:50}} onPress={()=>{Actions.editpartner({partnerDetails: selectedPartner})}}>
              <Text style={{color:global.text}}>EDIT</Text>
            </TouchableOpacity>
          </View>
        </View>
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

export default Centers;
