import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Button, Dimensions, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import * as Location from 'expo-location';
import { LocationObject, LocationObjectCoords } from 'expo-location';
import { LatLongToXY } from './src/util/utm'
import { toRadians } from './src/util/trig';
import { Accelerometer, ThreeAxisMeasurement } from 'expo-sensors';
import { Subscription } from 'expo-sensors/build/Pedometer';
import { useFonts } from 'expo-font'
import { Client } from './src/framework/objects/Client';
import Overworld from './src/scenes/Overworld';
import Combat from './src/scenes/Combat';
import SceneManager, { setGlobalScene } from './src/framework/objects/SceneManager';
import { getHeight, getWidth } from './src/util/screen';
import Loading from './src/scenes/Loading';
import { Deck } from './src/scenes/Deck';
import { setCustomText } from 'react-native-global-props';
const styles = StyleSheet.create({
  container: {
    fontFamily: 'Kirvy'
  }
})

interface Item {
  x: number,
  y: number,
  type: 'item'|'marker'|'enemy'
}

export default function App() {
  const [id, setId] = useState<string>()
  const [loaded] = useFonts({
    Kirvy: require('./assets/fonts/KirvyRegular.otf'),
    KirvyBold: require('./assets/fonts/KirvyBold.otf'),
  });
  
  function onLoad() {
    console.log('loaded')
    setId(Client.id)
  }
  function onTick() {

  }

  useEffect(() => {
    Client.start()

    const loadId = Client.on('load', onLoad)
    const tickId = Client.on('tick', onTick)
  

    return () => {
      Client.removeListener('load', loadId)
      Client.removeListener('tick', tickId)
    }

  }, [])

  if (!loaded) {
    return null;
  }

  const customTextProps = {
    style: {
      fontFamily: 'KirvyBold'
    }
  }
  setCustomText(customTextProps)


  return (
    <View>
      <StatusBar hidden />
      <SceneManager>
        <Loading key='loading' />
        <Overworld key='overworld' />
        <Combat key='combat'/>
        <Deck key='deck'/>
      </SceneManager>
    </View>
  )

//   <View style={{flexDirection: 'row', top: getHeight()-90, position: 'absolute', backgroundColor: 'gray', width: getWidth(), alignItems: 'center'}}>
//   <Button title='overworld' onPress={()=>{setGlobalScene('overworld')}}/>
//   <Button title='combat' onPress={()=>{setGlobalScene('combat')}}/>
//   {/* <Text>{id}</Text> */}
// </View>
} 
