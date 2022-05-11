import { LocationHeadingObject, LocationObject } from "expo-location";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Button, Platform, TouchableOpacity } from "react-native";
import Circle from "../framework/components/Circle";
import { ObjectRenderer } from "../framework/objects/BaseObject";
import { Client } from "../framework/objects/Client";
import { Enemy } from "../framework/objects/Enemy";
import Player from "../framework/objects/Player";
import { getCenter } from "../util/screen";
import { toRadians } from "../util/trig";
import { LatLongToXY } from "../util/utm";
import ExpoLocation from "expo-location";
import { pixelsInMeter, combatRange } from "../util/global_data";
import { setGlobalScene } from "../framework/objects/SceneManager";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#2f3542'
  }
});

let location: LocationObject;
let heading: LocationHeadingObject;

export default function Overworld() {
  // const [location, setLocation] = useState<LocationObject>();
  // const [heading, setHeading] = useState<LocationHeadingObject>()
  const [players, setPlayers] = useState<JSX.Element[]>([]);
  const [error, setError] = useState<string>('')
  useEffect(() => {
    // let enemy = new Enemy(getCenter())
    // player = new Player(getCenter())
    // enemy.shift(100, 0)
    // // Client.log(Platform.OS)
    function updatePlayers(location?: LocationObject, heading?: LocationHeadingObject) {
      // Client.log('Updating players')
      if (!location || !location.coords || !heading) {
        // Client.log('Exit early' + location + location?.coords + heading)
        return
      }
      const { x: lX, y: lY } = LatLongToXY(location?.coords.latitude, location?.coords.longitude);
      // Client.log(`Location: ${lX}, ${lY}`)
      // Client.log(`Players: ${Client.players.length}`)
      const center = getCenter();
      const cosR = Math.cos(toRadians(heading.trueHeading))
      const sinR = Math.sin(toRadians(heading.trueHeading))


      setPlayers(Client.players.map(p => {
        let rX = lX - p.x;
        let rY = lY - p.y;
        const dist = Math.sqrt(rX * rX + rY * rY)
        let tX = -((rX * cosR) - (rY * sinR));
        let tY = ((rX * sinR) + (rY * cosR));
        // Client.log(`[${p.id}] UTM      ${p.x}, ${p.y}`)
        // Client.log(`[${p.id}] Relative ${rX}, ${rY}`);



        return (
          <View key={p.id} style={{ top: (tY * pixelsInMeter) + center.y, left: (tX * pixelsInMeter) + center.x }}>
            <Circle diameter={20} color={dist <= combatRange ? '#1e90ff' : '#2f3542'} borderColor='#ffffff' borderWidth={2} onTouchStart={async () => {
              if (dist > combatRange) return;

              Client.log('trying battle')
              setError('Waiting for response!')

              const resp = await Client.POST(`battle?id=start-battle&me=${Client.id}&op=${p.id}`)
              setError('')
              const text = resp.data
              Client.log(text)
              if (text !== 'ok') {
                Client.log('failed' + text)
                setError(text)
                setTimeout(() => setError(''), 500)
              }
            }} />
          </View>
        )
      }));
    }

    // const interval = setInterval(updatePlayers, 50);

    const loc = Client.on('location-update', (newLocation: LocationObject) => {
      location = newLocation ?? location;
      updatePlayers(location, heading);
      // setLocation(newLocation);

    });
    const hea = Client.on('heading-update', (newHeading: LocationHeadingObject) => {
      heading = newHeading ?? heading
      updatePlayers(location, heading)
    })

    const pla = Client.on('update-players', () => {
      updatePlayers(location, heading);
    })

    // const loa = Client.on('load', async () => {
    //   const lastLocation = await ExpoLocation.getLastKnownPositionAsync()
    //   if(!lastLocation) return
    //   setLocation(lastLocation);
    // })

    // Client.on('tick', () => {
    //   updatePlayers(location, heading);
    // })

    return () => {
      Client.removeListener('location-update', loc)
      Client.removeListener('update-players', pla)
      Client.removeListener('heading-update', hea)
      // Client.removeListener('load', loa)

    }
  }, [])
  return (
    <View style={styles.container}>
      <Player pos={getCenter()} />
      {players}
      {error !== '' &&
        <View style={{
          width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center',
          position: 'absolute', backgroundColor: 'black', opacity: 0.5
        }}>
          <Text style={{ 'color': 'white', fontSize: 20 }}>{error}</Text>
        </View>}
      <TouchableOpacity style={{
        position: 'absolute', bottom: 32, left: 32, backgroundColor: '#ffa502',
        width: 64, height: 64, borderRadius: 8, justifyContent: 'center', alignItems: 'center'
      }} onPress={() => {
        setGlobalScene('deck')
      }}>
        <View style={{ width: 40, height: 56, borderColor: 'white', borderWidth: 4, borderRadius: 8 }}></View>
      </TouchableOpacity>
    </View>
  )
}   