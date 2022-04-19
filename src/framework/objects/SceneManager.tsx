import React, { Dispatch, SetStateAction, useState } from "react"
import { View } from "react-native"
import Combat from "../../scenes/Combat"
import Loading from "../../scenes/Loading"
import Overworld from "../../scenes/Overworld"




export let globalScene = ''

export let setGlobalScene = (scene: string) => { }

export default function SceneManager() {
    const [scene, setScene] = useState('loading')
    setGlobalScene = (scene: string) => { setScene(scene) }
    globalScene = scene
    switch (scene) {
        case 'loading':     return <Loading />
        case 'overworld':   return <Overworld />
        case 'combat':      return <Combat />
        default:            return <View />
    }
}

