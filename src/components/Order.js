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
  RefreshControl
} from 'react-native';


import {Actions,Router,Stack,Scene,Drawer} from 'react-native-router-flux';
import Plans from '../components/Plans';
import Info from '../components/Info';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';
import SegmentedControlTab from "react-native-segmented-control-tab";
import { Modalize } from 'react-native-modalize';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const db = firestore()
var currentUser = auth().currentUser;

import moment from 'moment';

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


const Order = ({userRole}) => {
  const [index, setIndex] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState({});
  const [imagePreview, setImagePreview] = useState(false);
  const [role, setRole] = useState(userRole);

  const [myOrders, setMyOrders] = useState([]);

  const [loading, setLoading] = useState(false);


  const [lastVisibleOrder,setLastVisibleOrder] = useState();
  const [orderPagination,setOrderPagination] = useState(true);
  const [refreshing, setRefreshing] = React.useState(true);

  const myOrderPopupContent = useRef<Modalize>(null);

  useEffect(()=>{
    console.log( currentUser )
    getMyPlans()
  },[])


  const getMyPlans=()=>{
    console.log('fetching my orders>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+role)
    var query;
        if(role=='admin'){
          query = db.collection("orders")
          .limit(global.pagination)
          .orderBy('orderDate', 'desc')
        }else{
          query = db.collection("orders")
          .where('uid', '==', global.userData.uid)
          .orderBy('orderDate', 'desc')
          .limit(global.pagination)
        }
    query.get()
    .then((querySnapshot) => {

      var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
      setLastVisibleOrder(lastVisible)

      setOrderPagination(true)

      var tempArray = []
      querySnapshot.forEach((doc) => {
           console.log('doc.data()>>>>>>>>>>>>>'+doc.data().fullName)
           var eachElement =  doc.data()
           tempArray.push(eachElement)
        })
        global.myPlan = tempArray;
        setMyOrders(tempArray);
        setRefreshing(false)
    })
  }


  const getNextMyPlans=()=>{
      console.log('getNextMyPlans my plans>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+role)
      if (orderPagination) {
        setLoading(true)
      var query;
          if(role=='admin'){
            query = db.collection("orders")
            .limit(global.pagination)
            .orderBy('orderDate', 'desc')
            .startAfter(lastVisibleOrder)
          }else{
            query = db.collection("orders")
            .where('uid', '==', global.userData.uid)
            .limit(global.pagination)
            .orderBy('orderDate', 'desc')
            .startAfter(lastVisibleOrder)
          }
      query.get()
      .then((querySnapshot) => {

        var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
        setLastVisibleOrder(lastVisible)

        var tempArray = []
        tempArray = myOrders;
        querySnapshot.forEach((doc) => {
             console.log('doc.data()>>>>>>>>>>>>>'+doc.data().fullName)
             var eachElement =  doc.data()
             tempArray.push(eachElement)
          })
          global.myPlan = tempArray;

          if(querySnapshot.docs.length < global.pagination){
              console.log('tempArray.lengthtempArray.lengthtempArray.lengthtempArray.length:::'+tempArray.length)

              setOrderPagination(false)
            }


          setMyOrders([...tempArray],[setLoading(false)]);

      })
    }
  }

  const onOpenPlan = () => {
    myOrderPopupContent.current?.open();
  };

  const onClosePlan = () => {
    myOrderPopupContent.current?.close();
  };


  const renderItem = ({item}) => {

        return(
 
       <TouchableOpacity  style={{width:windowWidth, height:140}} onPress={()=>{setSelectedOrder(item,[onOpenPlan()])}}>
        <View style={{backgroundColor:global.white, borderRadius:10, height:120, padding:15, justifyContent:'center', marginLeft:20, marginRight:20}}>
          

          <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
            <View style={{borderRightWidth:1, paddingRight:15, borderColor:global.border}}>
              <Text style={{color:global.text, fontSize:11}}>Policy Number</Text>
              <Text style={{fontWeight:'bold', color:global.primary, fontSize:12}}>{item.policyNumber}</Text>

              <View>
               <Text style={{fontSize:11, marginTop:2, color:global.text, marginTop:15}}>Name: {item.fullName}</Text>
                <Text style={{fontSize:11, marginTop:2, color:global.text}}>Placed on: {moment(item.orderDate*1000).format('DD-MM-YYYY')}</Text>
                <Text style={{fontSize:11, color:global.text}}>Transaction Id: {item.transactionId}</Text>
              </View>
            </View>

            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Text style={{fontSize:14, color:global.text, fontWeight:'bold'}}>₹ {item.plan.annualPremium}</Text>
              <FontAwesome5 name={'check-circle'} solid style={{fontSize:12, color:global.success, paddingLeft:5}}/>
            </View>
          </View>

        </View>
      </TouchableOpacity>

      )
  }


  const listEmptyComponent = () =>{
    if(refreshing){
      return(<View></View>)
    }else{
      return(
        <View style={{flex:1, justifyContent:'center', alignItems:'center', height:windowHeight-200}}>
          <Image
                resizeMode = {'contain'}
                style={{width: windowWidth, height:(windowWidth)*0.54}}
                source={require('../assets/empty.png')}
              />
          <Text style={{color:global.info, marginTop:20}}>No order available</Text>
        </View>
      )
    }
  }
  
  return (
    <View style={{flex:1}}>
      <View style={{flexDirection:'row', justifyContent:'space-between', paddingLeft:10, paddingRight:10, height:50, alignItems:'center', marginTop:10}}>
          
          <View style={{flexDirection:'row', alignItems:'center', paddingLeft:10, height:50}}>
            <Text  style={{color:global.info}}>{role == 'admin'?"ALL ORDERS":"MY ORDERS"}</Text>
          </View>


          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image
              style={{height:18,width:18}}
              source={require('../assets/logoGrey.png')}
            />
            <Text style={{fontSize:18, fontWeight:'bold', paddingLeft:5, color:global.info}}>Monaram</Text>

          </View>
      </View>
      
      <FlatList
        style={{paddingBottom:100}}
        data={myOrders}
        renderItem={(item)=>renderItem(item)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={listEmptyComponent}
        onEndReached={()=>{getNextMyPlans()}}
          onEndReachedThreshold={0.2}

        refreshControl={<RefreshControl
                refreshing={refreshing}
                onRefresh={()=>{getMyPlans()}}
              />
          }

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


      <Modalize 
      ref={myOrderPopupContent}
      modalHeight={windowHeight-40}
      >
        {selectedOrder.hasOwnProperty('policyNumber')?
        <View style={{justifyContent:'center'}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', height:50, alignItems:'center'}}>

              <View style={{paddingLeft:20}}>
                 <Text style={{fontWeight:"bold", fontSize:16, color:global.black}}></Text>
              </View>

              <View style={{paddingLeft:20}}>
                 <Text style={{fontWeight:"bold", fontSize:16, color:global.primary}}>{selectedOrder.plan.name}</Text>
              </View>
              <TouchableOpacity style={{paddingRight:20, height:'100%', justifyContent:'center', paddingLeft:20}}  onPress={()=>{onClosePlan()}}>
                 <FontAwesome5 name={'times'} light style={{fontSize:25, color:global.black}}/>
              </TouchableOpacity>
            </View>


            <View style={{width:windowWidth, alignItems:'center', marginTop:20}}>
              <View style={{width:windowWidth-50, padding:10, borderRadius:10, flexDirection:'row'}}>
                <View>
                  <FontAwesome5 name={'id-card'} light style={{fontSize:18, color:global.black}}/>
                </View>
                <View style={{marginLeft:10}}>
                  <Text style={{color:global.text}}>Policy Number</Text>
                  <Text style={{fontSize:16, color:global.primary}}>{selectedOrder.policyNumber}</Text>
                  <Text style={{fontSize:12, color:global.info, marginTop:5}}>Valid till : {selectedOrder.validity}</Text>
                </View>
              </View>

              <View style={{flexDirection:'row', width:windowWidth-50, padding:10, borderRadius:10}}>
                <View>
                  <FontAwesome5 name={'map-marker-alt'} light style={{fontSize:18, color:global.black}}/>
                </View>

                <View style={{marginLeft:10}}>
                  <Text style={{fontSize:14, fontWeight:'bold', color:global.black}}>{selectedOrder.fullName}</Text>
                  <Text style={{marginTop:5, color:global.black, fontSize:12}}>{selectedOrder.address}</Text>
                  <Text style={{color:global.black, fontSize:12}}>{selectedOrder.addressCont}</Text>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Text style={{color:global.black, fontSize:12}}>{selectedOrder.city}, </Text>
                    <Text style={{color:global.black, fontSize:12}}>{selectedOrder.state}</Text>
                  </View>
                  <Text style={{color:global.black, fontSize:12}}>{selectedOrder.pin}</Text>
                  <Text style={{marginTop:10, color:global.black, fontSize:12}}>{selectedOrder.phone}</Text>
                  {selectedOrder.hasOwnProperty('email')?
                    <Text style={{marginTop:0, color:global.black, fontSize:10}}>{selectedOrder.email}</Text>
                    : null
                  }
                  
                </View>
              </View>

              <View style={{width:windowWidth-50, padding:10, borderRadius:10, flexDirection:'row'}}>
                <View>
                  <FontAwesome5 name={'id-badge'} light style={{fontSize:18, color:global.black}}/>
                </View>
                <View style={{marginLeft:10}}>
                  <Text style={{color:global.text}}>{selectedOrder.proofType.toUpperCase()}</Text>
                  <TouchableOpacity style={{width:80, justifyContent:'center', alignItems:'center', height:80, marginTop:10}} onPress={()=>{ myOrderPopupContent.current?.close(); setImagePreview(true)}}>
                    <View style={{justifyContent:'center', alignItems:'center', width:60, height:60, backgroundColor:global.border, borderRadius:10}}>
                      <Image
                        style={{height:80,width:80, borderRadius:10}}
                        source={{uri: selectedOrder.proofLink}}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>


              <View style={{width:windowWidth-50, padding:10, borderRadius:10, flexDirection:'row'}}>
                <View>
                  <FontAwesome5 name={'id-badge'} light style={{fontSize:18, color:global.black}}/>
                </View>
                <View style={{marginLeft:10}}>
                  <Text style={{color:global.text}}>Transaction Id</Text>
                  <Text style={{color:global.black, fontSize:12, marginTop:5}}>{selectedOrder.transactionId}</Text>
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
              source={{uri:selectedOrder.proofLink}}
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

export default Order;
