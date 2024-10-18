//App.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as Location from 'expo-location';

import MapViewComponent from './components/MapViewComponent';
import SearchBarComponent from './components/SearchBarComponent';
import { getRoute } from './utils/geoapifyApi';

export default function App() {
  const [location, setLocation] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [isTypingOrigin, setIsTypingOrigin] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    })();
  }, []);

  const handleFindRoute = async () => {
    if (origin && destination) {
      try {
        const route = await getRoute(origin, destination);
        //console.log('Ruta obtenida:', route);  // Agregar para ver si se obtiene la ruta
        console.log('Ruta antes de setear:', route);

        setRouteCoordinates(route);
      } catch (error) {
        console.error('Error al buscar la ruta:', error);
        Alert.alert('Error', 'No se pudo encontrar la ruta. Inténtalo de nuevo.');
      }
    } else {
      Alert.alert('Advertencia', 'Debes establecer tanto el origen como el destino');
    }
  };

  return (
    <View style={styles.container}>
      {location && (
        <>
          {/* Mapa */}
          <MapViewComponent
            location={location}
            origin={origin}
            destination={destination}
            routeCoordinates={routeCoordinates}
          />

          {/* Cuadro de búsqueda para origen */}
          <SearchBarComponent
            searchType="origin"
            setSearchResult={setOrigin}
            setIsTyping={setIsTypingOrigin}
          />

          {/* Cuadro de búsqueda para destino, que desaparece mientras se escribe el origen */}
          {!isTypingOrigin && (
            <SearchBarComponent
              searchType="destination"
              setSearchResult={setDestination}
            />
          )}

          {/* Botón para buscar la ruta */}
          <TouchableOpacity style={styles.routeButton} onPress={handleFindRoute}>
            <Text style={styles.routeButtonText}>Buscar Ruta</Text>
          </TouchableOpacity>

        
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
 
  routeButton: {
    position: 'absolute',
    top: 220,
    right: 10,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 1,
  },
  routeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
