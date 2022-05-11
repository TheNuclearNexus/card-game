import { Dimensions } from "react-native"

const viewMeters = 500
export const combatRange = 200
export const pixelsInMeter = Dimensions.get('screen').width / viewMeters


// export const url = 'http://2.tcp.ngrok.io:10816' // School Wifi
// export const url = 'http://172.20.10.3:3000'   // Phone Hotspot
// export const url = 'http://10.42.0.1:3000'     // School Ethernet
// export const url = 'http://192.168.156.136:3000' // Home Wifi
// export const url = 'http://100.36.173.115:25565'
// export const url = 'http://localhost:3000'
export const url = 'http://10.105.195.63:3000'