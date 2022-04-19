import React from 'react'
import { View } from 'react-native';
import Circle from '../components/Circle';
import { BaseObject } from './BaseObject';


function EnemyComponent() {
    return (<View>
        <Circle diameter={14} borderColor='white' color='blue'/>
    </View>)
}

export class Enemy extends BaseObject {
    public render() {
        return <Circle diameter={14} borderColor='white' color='blue'/>
    }
}