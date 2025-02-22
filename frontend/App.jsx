import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Navigation from './src/navigation/Navigation'
import 'react-native-gesture-handler'

const App = () => {
  return (
    <View style={styles.container}>
      <Navigation/>
    </View>
    
  )
}

export default App

const styles = StyleSheet.create({
  container:{
    height:"100%",
    width:"100%"
  }
})