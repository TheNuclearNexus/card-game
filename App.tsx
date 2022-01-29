import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Button, Dimensions, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import * as Location from 'expo-location';
import { LocationObject, LocationObjectCoords } from 'expo-location';
import { LatLongToXY } from './util/utm'
import { toRadians } from './util/trig';
import { Accelerometer, ThreeAxisMeasurement } from 'expo-sensors';
import { Subscription } from 'expo-sensors/build/Pedometer';

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

function EnemyCircle(props: any) {
  const circle: StyleProp<ViewStyle> = {
    width: props.diameter,
    height: props.diameter,
    borderRadius: props.diameter / 2,
    backgroundColor: props.color,
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
  y: number
}


export default function App() {
  const [location, setLocation] = useState({} as LocationObject);
  const [prevLocation, setPrevLocation] = useState({} as LocationObject)
  const [lastLocationUpdate, setLastLocationUpdate] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [accelSub, setAccelSub] = useState({} as Subscription)
  const [acceleration, setAcceleration] = useState({} as ThreeAxisMeasurement)
  const [items, setItems] = useState([] as Item[])
  const [zoom, setZoom] = useState(0)
  const updateSpeed = 100; // In miliseconds
  const attackRange = 10;

  const dataUpdateLoop = async () => {
    //await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    let heading = await Location.getHeadingAsync()

    if (prevLocation.coords == undefined && location.coords != undefined) {
      setPrevLocation(location)
    } else if (prevLocation.coords != undefined && location.coords != undefined && prevLocation.coords != location.coords) {
      let { latitude: aLat, longitude: aLong } = prevLocation.coords
      const { latitude: bLat, longitude: bLong } = location.coords

      if (aLat < bLat) {
        aLat += 0.000001;
        if (aLat >= bLat) aLat = bLat
      }
      else if (aLat > bLat) {
        aLat -= 0.000001;
        if (aLat <= bLat) aLat = bLat
      }

      if (aLong < bLong) {
        aLong += 0.000001;
        if (aLong >= bLong) aLong = bLong
      }
      else if (aLong > bLong) {
        aLong -= 0.000001;
        if (aLong <= bLong) aLong = bLong
      }

      let tempLocation = prevLocation
      tempLocation.coords.latitude = aLat
      tempLocation.coords.longitude = aLong
      setPrevLocation(tempLocation)

    }
    setRotation(Math.round(heading.trueHeading))
    setTimeout(dataUpdateLoop, updateSpeed);
  }

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }
      Location.watchPositionAsync({ accuracy: Location.Accuracy.Lowest }, (newLocation) => {
        console.log('new location')
        setLocation(newLocation)
        setLastLocationUpdate(Date.now())
      })

      const location = await Location.getLastKnownPositionAsync()
      if (location != null) {
        setLocation(location)
        setPrevLocation(location)
        setLastLocationUpdate(Date.now())

        const coords = LatLongToXY(location.coords.latitude, location.coords.longitude);

        items.push({
          x: coords.x,
          y: coords.y
        })

        for (let i = 0; i < 3; i++) {
          const item = {
            x: (Math.random() * 20 - 10) + coords.x,
            y: (Math.random() * 20 - 10) + coords.y
          }
          item.x += item.x < 0 ? -10 : 10
          item.y += item.y < 0 ? -10 : 10

          items.push(item)
        }
        setItems(items)
        console.log(items)
      }
      setTimeout(dataUpdateLoop, updateSpeed);

      setAccelSub(Accelerometer.addListener((data) => {
        setAcceleration(data)
      }))

    })();
  }, [setLocation]);

  const renderLocation = () => {
    const coords = LatLongToXY(prevLocation.coords.latitude, prevLocation.coords.longitude)
    return (
      <View>
        {renderItems(coords)}
        <View style={{ left: 16, top: 32 }}>
          <Text style={{ color: 'white' }}>{location.coords.latitude}</Text>
          <Text style={{ color: 'white' }}>{location.coords.longitude}</Text>
          <Text style={{ color: 'white' }}>{rotation}</Text>
          <Text style={{ color: 'white' }}>{acceleration.x}</Text>
          <Text style={{ color: 'white' }}>{acceleration.y}</Text>
          <Text style={{ color: 'white' }}>{new Date(lastLocationUpdate).toLocaleTimeString()}</Text>
          <Button title='Zoom' onPress={() => { setZoom((zoom + 1) % 20) }} />
        </View>
      </View>
    )
  }

  const renderItems = (coords: { x: number, y: number }) => {
    let itemViews: JSX.Element[] = []

    const cosR = Math.cos(toRadians(rotation))
    const sinR = Math.sin(toRadians(rotation))


    for (let i in items) {
      const item = items[i]
      const x = item.x - coords.x
      const y = item.y - coords.y

      itemViews.push(
        // <EnemyCircle key={i} diameter={12} x={y * meterToPixel} y={x * meterToPixel} />
        <EnemyCircle key={i} color={Math.sqrt(x * x + y * y) <= attackRange ? '#DD2222' : '#441111'} diameter={12} x={(x * cosR - y * sinR) * meterToPixel / 2} y={(y * cosR + x * sinR) * meterToPixel / 2} />
      )
    }

    return (
      <View>
        {itemViews}
      </View>
    )
  }

  const meterToPixel = 5 + (zoom)


  return (
    <View>
      <StatusBar hidden></StatusBar>
      {prevLocation.coords !== undefined && renderLocation()}
      <View style={styles.container}>
        <DashedCircle diameter={attackRange * meterToPixel} color='transparent' borderColor='#A0A0A0' borderWidth={2} />
        <Circle diameter={8} color='#2222DD' />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  }
});
