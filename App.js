import React, {Component} from 'react';
import {Platform, Text, View, StyleSheet} from 'react-native';
import {Constants, Location, Permissions} from 'expo';

export default class App extends Component {
  state = {
    targetCoordinate: {
      x: '-6.259613',
      y: '106.608156'
    },
    currentCoordinate: {
      x: '',
      y: ''
    },
    heading: ''
  };

  componentDidMount() {
    this._getLocationAsync();
  }

  render() {
    let {currentCoordinate, targetCoordinate, heading} = this.state;

    return (
      <View style={styles.container}>
        <View
          style={{
            width: 50,
            height: 250,
            backgroundColor: 'blue',
            transform: [
              {
                rotateZ:
                  calculateDegree(
                    currentCoordinate,
                    targetCoordinate,
                    heading
                  ) + 'deg'
              }
            ]
          }}
        >
          <View style={{width: 50, height: 50, backgroundColor: 'red'}} />
        </View>
      </View>
    );
  }

  _getLocationAsync = async () => {
    await Permissions.askAsync(Permissions.LOCATION);
    Location.watchHeadingAsync((heading) => {
      this.setState({heading: heading.magHeading});
    });
    Location.watchPositionAsync(
      {
        enableHighAccuracy: true,
        timeInterval: 5000,
        distanceInterval: 1
      },
      (position) => {
        this.setState({
          currentCoordinate: {
            x: position.coords.latitude,
            y: position.coords.longitude
          }
        });
      }
    );
  };
}

function calculateDegree(currentCoordinate, targetCoordinate, heading) {
  return (
    degreeToNorth(heading) +
    degreeFromNorth(currentCoordinate, targetCoordinate)
  );
}

function degreeToNorth(heading) {
  if (heading > 180) {
    return 360 - heading;
  }
  return heading * -1;
}

function degreeFromNorth(currentCoordinate, targetCoordinate) {
  let theta = getTheta(currentCoordinate, targetCoordinate);
  let degreeFromNorth =
    getDegree(currentCoordinate.y, targetCoordinate.y) - theta;
  let xCoordinates = {x1: currentCoordinate.x, x2: targetCoordinate.x};
  if (getSign(degreeFromNorth, xCoordinates) > 0) {
    return degreeFromNorth;
  } else {
    return 360 - degreeFromNorth;
  }
}

function getTheta(currentCoordinate, targetCoordinate) {
  let opposite;
  let adjacent;
  if (targetCoordinate.x > currentCoordinate.x) {
    opposite = Math.abs(targetCoordinate.x - currentCoordinate.x);
    adjacent = Math.abs(targetCoordinate.y - currentCoordinate.y);
  } else {
    opposite = Math.abs(targetCoordinate.y - currentCoordinate.y);
    adjacent = Math.abs(targetCoordinate.x - currentCoordinate.x);
  }
  let radian = Math.atan(opposite / adjacent);
  return radian * 180 / Math.PI;
}

function getDegree(yOrigin, yDestination) {
  if (yDestination > yOrigin) {
    return 90;
  }
  return 180;
}

function getSign(x, xCoordinates) {
  return isDisplacementBendRight(xCoordinates.x1, xCoordinates.x2)
    ? x * 1
    : x * -1;
}

function isDisplacementBendRight(xOrigin, xDestination) {
  return xDestination > xOrigin;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1'
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center'
  }
});
