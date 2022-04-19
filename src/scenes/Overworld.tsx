import { LocationObject } from "expo-location";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Button } from "react-native";
import Circle from "../framework/components/Circle";
import { ObjectRenderer } from "../framework/objects/BaseObject";
import { Client } from "../framework/objects/Client";
import { Enemy } from "../framework/objects/Enemy";
import Player from "../framework/objects/Player";
import { getCenter } from "../util/screen";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#303037'
  }
});

export default function Overworld() {
  const [location, setLocation] = useState<LocationObject>();
  useEffect(() => {
    // let enemy = new Enemy(getCenter())
    // player = new Player(getCenter())
    // enemy.shift(100, 0)
    Client.on('location-update', (location) => {
      setLocation(location);
    })
  }, [])
  return (
    <View style={styles.container}>
      <Player pos={getCenter()}/>
    </View>
  )
}