import React, { Component } from 'react'
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  PanResponder,
  UIManager,
  View
} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25
const SWIPE_OUT_DURATION = 250

class Deck extends Component {
  static defaultProps = {
    onSwipeLeft: () => {},
    onSwipeRight: () => {}
  }

  constructor(props) {
    super(props)

    const position = new Animated.ValueXY()
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, { dx, dy }) => {
        position.setValue({ x: dx, y: dy })
      },
      onPanResponderRelease: (event, { dx }) => {
        dx > SWIPE_THRESHOLD
          ? this.swipe('right')
          : dx < SWIPE_THRESHOLD
            ? this.swipe('left')
            : this.resetPosition()
      }
    })

    this.state = { panResponder, position, index: 0 }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({ index: 0 })
    }
  }

  componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true)
    LayoutAnimation.spring()
  }

  swipe = direction => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH
    Animated.timing(this.state.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => {
      this.onSwipeComplete(direction)
    })
  }

  onSwipeComplete = direction => {
    const { data, onSwipeLeft, onSwipeRight } = this.props
    const item = data[this.state.index]
    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item)
    this.state.position.setValue({ x: 0, y: 0 })
    this.setState({ index: this.state.index + 1 })
  }

  resetPosition = () => {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 }
    }).start()
  }

  getCardStyle = () => {
    const { position } = this.state
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    })
    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    }
  }

  renderCards = () => {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards()
    }

    return this.props.data
      .map((item, i) => {
        if (i < this.state.index) {
          return null
        }

        if (i === this.state.index) {
          return (
            <Animated.View
              key={item.id}
              style={[this.getCardStyle(), styles.cardStyle]}
              {...this.state.panResponder.panHandlers}
            >
              {this.props.renderCard(item)}
            </Animated.View>
          )
        }

        return (
          <Animated.View
            key={item.id}
            style={[styles.cardStyle, { top: 10 * (i - this.state.index) }]}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        )
      })
      .reverse()
  }
  render() {
    return <View>{this.renderCards()}</View>
  }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
}

export default Deck
