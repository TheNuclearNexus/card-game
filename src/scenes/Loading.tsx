import React, { useEffect, useState } from 'react'
import { View, Text, Dimensions, StyleSheet } from 'react-native'
import { Client } from '../framework/objects/Client';
import { setGlobalScene } from '../framework/objects/SceneManager';



const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'absolute',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: '#2f3542',
        justifyContent: 'center',
        alignItems: 'center'
    }
});

const loadingCharacters = [
    '|',
    '/',
    '-',
    '\\',
    '|',
    '/',
    '-',
    '\\'
]

export default function Loading(props: any) {
    const [loadChar, setLoadChar] = useState(0)
    useEffect(() => {
        const addLoadChar = setInterval(() => {
            setLoadChar((loadChar + 1) % loadingCharacters.length)
        }, 500)

        Client.on('load', () => {
            clearInterval(addLoadChar)
            setGlobalScene('overworld')
        })

        return () => {
            clearInterval(addLoadChar)
        }    
    }, [])
    return (
        <View style={styles.container}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 56 }}>Loading {loadingCharacters[loadChar]}</Text>
        </View>
    )
}