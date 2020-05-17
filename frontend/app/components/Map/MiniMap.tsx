import React, { Component } from "react";
import Dimensions from "../../styles/Dimensions";
import { Region, Location, Coords, FocusLocation } from '../../types/location';
import MapView, {Marker} from 'react-native-maps';
import { DEFAULT_LAT_DELTA, DEFAULT_LONG_DELTA } from "../../constants/Location";
import EStyleSheet from "react-native-extended-stylesheet";
import { setUserCoords } from "../../reduxstore/actions/location";
import { connect } from "react-redux";

interface MiniMapProps {
  locationCoords: Coords;
  setUserCoords: (c: Coords) => void;
}

class MiniMap extends Component<MiniMapProps, {}> {

  render() {
    const { locationCoords } = this.props;
    return (
      locationCoords ?
      <MapView 
          style={styles.mapStyle}
          region={{
          ...locationCoords,
          latitudeDelta: DEFAULT_LAT_DELTA,
          longitudeDelta: DEFAULT_LONG_DELTA,
          }}
          onUserLocationChange={(res) => {
            this.props.setUserCoords({
              latitude: res.nativeEvent.coordinate.latitude,
              longitude: res.nativeEvent.coordinate.longitude,
            });
          }}
          scrollEnabled={false}
          zoomEnabled={false}
      >
        <Marker
          coordinate={locationCoords}
        />
      </MapView>
    :
    null
    )
  } 
}

const MiniMapContainer = connect(
  state => ({
  }),
  { setUserCoords }
)(MiniMap);

export default MiniMapContainer;

const styles = EStyleSheet.create({
  mapStyle: {
    width: Dimensions.width,
    height: Dimensions.height * 0.25,
  },
})
