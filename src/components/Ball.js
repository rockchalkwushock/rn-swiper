import React, { Component } from 'react'
import { Animated, View } from 'react-native'

class Ball extends Component {
  state = {}
  componentWillMount() {
    this.position = new Animated.ValueXY(0, 0)
    Animated.spring(this.position, {
      toValue: { x: 200, y: 500 }
    }).start()
  }
  render() {
    return (
      <Animated.View style={this.position.getLayout()}>
        <View style={styles.root.ball} />
      </Animated.View>
    )
  }
}

const styles = {
  root: {
    ball: {
      borderColor: 'black',
      borderRadius: 30,
      borderWidth: 30,
      height: 60,
      width: 60
    }
  }
}

export default Ball
