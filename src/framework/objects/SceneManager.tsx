import React, { Dispatch, SetStateAction, useState } from "react"
import { View } from "react-native"

export let globalScene = ''

export let setGlobalScene = (scene: string) => { }

export default function SceneManager(props: { children: JSX.Element[] }) {
    const [scene, setScene] = useState('loading')
    setGlobalScene = (scene: string) => { setScene(scene) }
    globalScene = scene
    
    const children = props.children
    const element = children.find(c => c.key === scene)
    
    return element ?? <View/>
}

