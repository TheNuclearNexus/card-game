import axios from "axios"
import { Audio } from "expo-av"
import { url } from "../../util/global_data"


const sounds: {
    [key: string]: {
        serverId: string,
        audio?: Audio.Sound
    }
} = {
    'start-battle': {
        serverId: 'battle-start'
    },
    'win': {
        serverId: 'win'
    },
    'loss': {
        serverId: 'loss'
    },
    'play-card': {
        serverId: 'play-card'
    },
    'destroy-card': {
        serverId: 'destroy-card'
    }
}

export default class SFX {
    public static async loadSounds() {
        for (const sfxId in sounds) {
            const soundData = sounds[sfxId]
            const sound = new Audio.Sound()
            await sound.loadAsync({ 'uri' : url + '/audio?name=' + soundData.serverId}, { isLooping: false }, true)
            soundData.audio = sound
        }
    } 

    public static async play(sound: string) {
        const soundData = sounds[sound]
        if (soundData.audio) {
            return soundData.audio.playFromPositionAsync(0)
        }
    }
}