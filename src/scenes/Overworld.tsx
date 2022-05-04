import { LocationHeadingObject, LocationObject } from "expo-location";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Button, Platform } from "react-native";
import Circle from "../framework/components/Circle";
import { ObjectRenderer } from "../framework/objects/BaseObject";
import { Client } from "../framework/objects/Client";
import { Enemy } from "../framework/objects/Enemy";
import Player from "../framework/objects/Player";
import { getCenter } from "../util/screen";
import { toRadians } from "../util/trig";
import { LatLongToXY } from "../util/utm";
import ExpoLocation from "expo-location";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#2f3542'
  }
});


const viewMeters = 200
const pixelsInMeter = Dimensions.get('screen').width / viewMeters

export default function Overworld() {
  const [location, setLocation] = useState<LocationObject>();
  const [heading, setHeading] = useState<LocationHeadingObject>()
  const [players, setPlayers] = useState<JSX.Element[]>([]);
  useEffect(() => {
    // let enemy = new Enemy(getCenter())
    // player = new Player(getCenter())
    // enemy.shift(100, 0)
    // // Client.log(Platform.OS)
    function updatePlayers(location?: LocationObject, heading?: LocationHeadingObject) {
      // Client.log('Updating players')
      if (!location || !location.coords) {
        // Client.log('Exit early')
        return
      }
      const { x: lX, y: lY } = LatLongToXY(location?.coords.latitude, location?.coords.longitude);
      // Client.log(`Location: ${lX}, ${lY}`)
      // Client.log(`Players: ${Client.players.length}`)
      const center = getCenter();
      setPlayers(Client.players.map(p => {
        let rX = lX - p.x;
        let rY = lY - p.y;
        // Client.log(`[${p.id}] UTM      ${p.x}, ${p.y}`)
        // Client.log(`[${p.id}] Relative ${rX}, ${rY}`);

        // rX = rX * Math.cos(toRadians(heading.magHeading)) - rY * Math.sin(toRadians(heading.magHeading));
        // rY = rX * Math.sin(toRadians(heading.magHeading)) + rY * Math.cos(toRadians(heading.magHeading));


        return (
          <View key={p.id} style={{ top: (rY * pixelsInMeter) + center.y, left: (rX * pixelsInMeter) + center.x }}>
            <Circle diameter={14} color='#2f3542' borderColor='#ffffff' borderWidth={2} />
          </View>
        )
      }));
    }

    // const interval = setInterval(updatePlayers, 50);

    Client.on('location-update', (location: LocationObject) => {
      setLocation(location);
      updatePlayers(location, heading);

    });
    Client.on('update-players', () => {
      updatePlayers(location, heading);
    })

    Client.on('load', async () => {
      const lastLocation = await ExpoLocation.getLastKnownPositionAsync()
      if(!lastLocation) return
      setLocation(lastLocation);
    })

    // Client.on('tick', () => {
    //   updatePlayers(location, heading);
    // })

    // return () => {clearInterval(interval)}
  })
  return (
    <View style={styles.container}>
      {players}
      <Player pos={getCenter()} />
      <Text style={{ top: getCenter().y }}>{(location !== undefined && location.coords !== undefined) ? `${location.coords.latitude} ${location.coords.longitude}` : ''}</Text>
      <Text style={{ top: getCenter().y + 10 }}>{(heading !== undefined) ? `${heading.magHeading}` : ''}</Text>
    </View>
  )
}