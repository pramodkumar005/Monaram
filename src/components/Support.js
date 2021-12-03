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
import Plans from '../components/Plans';
import Info from '../components/Info';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5Pro';

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


const Support = () => {
  const [home, setHome] = useState(true);
  const [center, setCenter] = useState(false);
  const [user, setUser] = useState(false);
  const [support, setSupport] = useState(false);

  useEffect(()=>{
    
  },[])

  
  return (
    <View style={{flex:1, backgroundColor:global.background}}>
        <View style={{flexDirection:'row', justifyContent:'space-between', paddingLeft:10, paddingRight:10, height:50, alignItems:'center', marginTop:10}}>
              
               <View style={{flexDirection:'row', alignItems:'center', paddingLeft:10, height:50}}>
                <Text style={{color:global.info}}>ABOUT US</Text>
              </View>


              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Image
                  style={{height:18,width:18}}
                  source={require('../assets/logoGrey.png')}
                />
                <Text style={{fontSize:18, fontWeight:'bold', paddingLeft:5, color:global.info}}>Monaram</Text>

              </View>
          </View>

        <View style={{width:'90%', paddingLeft:'5%', marginTop:40}}>
          <Text style={{color:global.text}}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </Text>

          <View  style={{marginTop:50}}>
            <Text style={{color:global.text}}>For any query please call us at</Text>
            <Text style={{color:global.primary}}> +91- 2131234234, 2345671234</Text>
          </View>
          <Text style={{marginTop:10}}>or</Text>
          <View  style={{marginTop:10}}>
            <Text style={{color:global.text}}>Write us at</Text>
            <Text style={{color:global.primary}}> sdasd@asdsa.com</Text>


            <Text style={{color:global.info, marginTop:50}}>version: v1.0.7</Text>
          </View>
          
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

export default Support;
