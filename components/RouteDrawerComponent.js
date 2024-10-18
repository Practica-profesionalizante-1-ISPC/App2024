// RouteDrawerComponent.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Polyline } from 'react-native-maps';
import { getRoute } from '../utils/geoapifyApi';

const RouteDrawerComponent = ({ origin, destination }) => {
  const [route, setRoute] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        if (origin && destination) {
          const { coordinates, distance, duration } = await getRoute(origin, destination);
          if (coordinates && coordinates.length > 0) {
            setRoute(coordinates);
            setRouteInfo({ distance, duration });
          }
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };
    fetchRoute();
  }, [origin, destination]);

  return (
    <>
      {route.length > 0 && (
        <Polyline
          coordinates={route}
          strokeColor="#2196F3"
          strokeWidth={4}
        />
      )}
      {routeInfo && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeText}>
            Distancia: {(routeInfo.distance / 1000).toFixed(2)} km
          </Text>
          <Text style={styles.routeText}>
            Duración: {Math.round(routeInfo.duration / 60)} min
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  routeInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default RouteDrawerComponent;