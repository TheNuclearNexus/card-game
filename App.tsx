import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Button, Dimensions, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import * as Location from 'expo-location';
import { LocationObject, LocationObjectCoords } from 'expo-location';
import { LatLongToXY } from './src/util/utm'
import { toRadians } from './src/util/trig';
import { Accelerometer, ThreeAxisMeasurement } from 'expo-sensors';
import { Subscription } from 'expo-sensors/build/Pedometer';
import { Client } from './src/framework/objects/Client';
import Overworld from './src/scenes/Overworld';
import Combat from './src/scenes/Combat';
import SceneManager, { setGlobalScene } from './src/framework/objects/SceneManager';
import { getHeight, getWidth } from './src/util/screen';
import Loading from './src/scenes/Loading';



function Circle(props: any) {
  const circle: StyleProp<ViewStyle> = {
    width: props.diameter,
    height: props.diameter,
    borderRadius: props.diameter / 2,
    backgroundColor: props.color,
    position: 'absolute'
  }

  return <View style={circle} />;
};

function ItemCircle(props: any) {
  const circle: StyleProp<ViewStyle> = {
    width: props.diameter,
    height: props.diameter,
    borderRadius: props.diameter / 2,
    backgroundColor: props.color,
    zIndex: 0,
    position: 'absolute',
    top: Dimensions.get('window').height / 2 - props.y - props.diameter / 2,
    left: Dimensions.get('window').width / 2 - props.x - props.diameter / 2
  }

  return <View style={circle} />;
};

function DashedCircle(props: any) {
  const circle: StyleProp<ViewStyle> = {
    width: props.diameter,
    height: props.diameter,
    borderRadius: props.diameter / 2,
    backgroundColor: props.color,
    borderWidth: props.borderWidth,
    borderColor: props.borderColor,
    borderStyle: 'dashed',
    position: 'absolute'
  }

  return <View style={circle} />;
};

interface Item {
  x: number,
  y: number,
  type: 'item'|'marker'|'enemy'
}

let lastLocationUpdate = 0
let items: Item[] = []
// export default function App() {
//   const [location, setLocation] = useState({} as LocationObject);
//   const [prevLocation, setPrevLocation] = useState({} as LocationObject)
//   const [rotation, setRotation] = useState(0)
//   const [accelSub, setAccelSub] = useState({} as Subscription)
//   const [acceleration, setAcceleration] = useState({} as ThreeAxisMeasurement)
//   const [zoom, setZoom] = useState(0)
//   const updateSpeed = 100; // In miliseconds
//   const attackRange = 10;

//   const dataUpdateLoop = async () => {
//     //await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
//     // let heading = await Location.getHeadingAsync()

//     if (prevLocation.coords == undefined && location.coords != undefined) {
//       setPrevLocation(location)
//       return
//     } else if (prevLocation.coords != undefined && location.coords != undefined && prevLocation.coords != location.coords) {
//       let { latitude: aLat, longitude: aLong } = prevLocation.coords
//       const { latitude: bLat, longitude: bLong } = location.coords

//       if (aLat < bLat) {
//         aLat += 0.000001;
//         if (aLat >= bLat) aLat = bLat
//       }
//       else if (aLat > bLat) {
//         aLat -= 0.000001;
//         if (aLat <= bLat) aLat = bLat
//       }

//       if (aLong < bLong) {
//         aLong += 0.000001;
//         if (aLong >= bLong) aLong = bLong
//       }
//       else if (aLong > bLong) {
//         aLong -= 0.000001;
//         if (aLong <= bLong) aLong = bLong
//       }

//       let tempLocation = prevLocation
//       tempLocation.coords.latitude = aLat
//       tempLocation.coords.longitude = aLong
//       setPrevLocation(tempLocation)

//     }
//     // setRotation(Math.round(heading.magHeading))
//   }

//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         alert('Permission to access location was denied');
//         return;
//       }
//       console.log('Starting to watch')
//       Location.watchPositionAsync({ accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 0.5 }, (newLocation) => {
//         console.log('new location', newLocation)
//         setLocation(newLocation)
//       })
//       Location.watchHeadingAsync((heading) => {
//         setRotation(heading.trueHeading)
//       })

//       // setInterval(dataUpdateLoop, updateSpeed);


//       setAccelSub(Accelerometer.addListener((data) => {
//         setAcceleration(data)
//       }))


//       const lastKnown = await Location.getLastKnownPositionAsync()
//       if (lastKnown != null) {
        
        

//         console.log('got old local')

//         const coords = LatLongToXY(lastKnown.coords.latitude, lastKnown.coords.longitude);

//         items.push({
//           x: coords.x,
//           y: coords.y + 3,
//           type: 'marker'
//         })

//         for (let i = 0; i < 3; i++) {
//           const item: Item = {
//             x: (Math.random() * 20 - 10) + coords.x,
//             y: (Math.random() * 20 - 10) + coords.y,
//             type: 'enemy'
//           }
//           item.x += item.x < 0 ? -10 : 10
//           item.y += item.y < 0 ? -10 : 10

//           items.push(item)
//         }


//         lastLocationUpdate = Date.now()
//         setLocation(lastKnown)
//         // console.log(items)
//       }

//     })();
//   }, [setLocation]);

//   const renderLocation = () => {
//     if (location.coords === undefined) {
//       return (
//         <View style={{ left: 16, top: 32 }}>
//           <Text style={{ color: 'white' }}>Waiting for position update</Text>
//         </View>
//       )
//     }

//     let latitude = Math.round(location.coords.latitude * 1e5) / 1e5
//     let longitude = Math.round(location.coords.longitude * 1e5) / 1e5

//     const coords = LatLongToXY(latitude, longitude)
//     return (
//       <View>
//         {renderItems(coords)}
//         <View style={{ left: 16, top: 32 }}>
//           <Text style={{ color: 'white' }}>Lat: {latitude}</Text>
//           <Text style={{ color: 'white' }}>Lon: {longitude}</Text>
//           <Text style={{ color: 'white' }}>X:   {coords.x}</Text>
//           <Text style={{ color: 'white' }}>Y:   {coords.y}</Text>
//           {/* <Text style={{ color: 'white' }}>{rotation}</Text>
//           <Text style={{ color: 'white' }}>{acceleration.x}</Text>
//           <Text style={{ color: 'white' }}>{acceleration.y}</Text> */}
//           <Text style={{ color: 'white' }}>{new Date(location.timestamp).toLocaleTimeString()}</Text>
//         </View>
//       </View>
//     )
//   }

//   const renderItems = (coords: { x: number, y: number }) => {
//     let itemViews: JSX.Element[] = []

//     const cosR = Math.cos(toRadians(rotation))
//     const sinR = Math.sin(toRadians(rotation))


//     for (let i in items) {
//       const item = items[i]
//       const x = item.x - coords.x
//       const y = item.y - coords.y

//       const rX = (x * cosR - y * sinR) * meterToPixel / 2
//       const rY = (y * cosR + x * sinR) * meterToPixel / 2
//       if(item.type === 'enemy') {
//         itemViews.push(
//           <ItemCircle key={i} color={Math.sqrt(x * x + y * y) <= attackRange ? '#DD2222' : '#441111'} diameter={12} x={rX} y={rY} />
//         )
//       } else {
//         itemViews.push(
//           <ItemCircle key={i} color={'#1111AA'} diameter={12} x={rX} y={rY}/>
//         )
//       }
//     }

//     return (
//       <View>
//         {itemViews}
//       </View>
//     )
//   }

//   const meterToPixel = 5 + (zoom)


//   return (
//     <View style={{backgroundColor:'#000', height: Dimensions.get('window').height}}>
//       <StatusBar hidden />
//       <View style={styles.container}>
//         <DashedCircle diameter={attackRange * meterToPixel} color='transparent' borderColor='#A0A0A0' borderWidth={2} />
//       </View>
//       {renderLocation()}
//       <View style={styles.container}>
//         <Circle diameter={8} color='#2222DD' />
//       </View>
//       <Button title='Zoom' onPress={() => { setZoom((zoom + 1) % 20) }} />
//     </View>
//   );
// }

export default function App() {
  const [id, setId] = useState<string>()
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

  return (
    <View>
      <StatusBar hidden />
      <SceneManager>
        <Loading key='loading' />
        <Overworld key='overworld' />
        <Combat key='combat'/>
      </SceneManager>
    </View>
  )

//   <View style={{flexDirection: 'row', top: getHeight()-90, position: 'absolute', backgroundColor: 'gray', width: getWidth(), alignItems: 'center'}}>
//   <Button title='overworld' onPress={()=>{setGlobalScene('overworld')}}/>
//   <Button title='combat' onPress={()=>{setGlobalScene('combat')}}/>
//   {/* <Text>{id}</Text> */}
// </View>
} 