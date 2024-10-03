import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Button, SafeAreaView, Alert, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';  // Asegúrate de que esto esté bien importado

const App = () => {
  const [markers, setMarkers] = useState([]);
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestLocationPermission();
    } else {
      getUserLocation(); // Para iOS no es necesario pedir permisos explícitamente en tiempo de ejecución
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Permiso de Ubicación",
          message: "La aplicación necesita acceder a tu ubicación.",
          buttonNeutral: "Preguntar después",
          buttonNegative: "Cancelar",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Permiso concedido");
        getUserLocation();
      } else {
        console.log("Permiso denegado");
        Alert.alert("Permiso denegado", "No se puede acceder a la ubicación sin permisos.");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getUserLocation = () => {
    if (Geolocation) {  // Verificar si Geolocation está definido
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(newRegion);
          setUserLocation(newRegion);
        },
        (error) => {
          Alert.alert('Error', 'No se pudo obtener la ubicación.');
          console.log(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      console.log("Geolocation no está disponible.");
    }
  };

  const addRandomMarker = () => {
    if (userLocation) {
      const newMarker = {
        latitude: userLocation.latitude + (Math.random() - 0.5) * 0.01,
        longitude: userLocation.longitude + (Math.random() - 0.5) * 0.01,
      };
      setMarkers([...markers, newMarker]);
    } else {
      Alert.alert("Ubicación no disponible", "No se pudo agregar un marcador ya que no se ha encontrado la ubicación del usuario.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        {region ? (
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={(reg) => setRegion(reg)}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                coordinate={marker}
                title={`Marker ${index + 1}`}
              />
            ))}
          </MapView>
        ) : (
          <Text>Obteniendo ubicación...</Text>
        )}
      </View>
      <View style={styles.controls}>
        <Text>Marcadores: {markers.length}</Text>
        <Button title="Añadir Marcador" onPress={addRandomMarker} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  controls: {
    padding: 10,
    backgroundColor: 'white',
  },
});

export default App;
