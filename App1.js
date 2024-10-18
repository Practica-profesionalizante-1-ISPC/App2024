import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, FlatList, Text, TouchableOpacity, Dimensions, KeyboardAvoidingView, StatusBar } from 'react-native';
import WebView from 'react-native-webview';
import * as Location from 'expo-location';
import debounce from 'lodash.debounce';


// const GEOAPIFY_API_KEY = "8026316fecc34fc880ebf57ea83c0e15"; // clave de Geoapify

const fetchStreetSuggestions = async (query, location) => {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&bias=proximity:${location.latitude},${location.longitude}&apiKey=${GEOAPIFY_API_KEY}`
    );
    const data = await response.json();
    return data.features.map(item => ({
      place_id: item.properties.place_id,
      display_name: item.properties.formatted,
      latitude: item.geometry.coordinates[1],
      longitude: item.geometry.coordinates[0],
    }));
  } catch (error) {
    console.error('Error fetching street suggestions:', error);
    return [];
  }
};

const fetchRoute = async (start, end) => {
  try {
    const url = `https://api.geoapify.com/v1/routing?waypoints=${start.latitude},${start.longitude}|${end.latitude},${end.longitude}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`;
    console.log('Fetching route with URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.features && data.features.length > 0) {
      const route = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      console.log("Ruta recibida:", route);
      return route;
    } else {
      console.error('No se pudo obtener la ruta o los datos no son válidos:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching route:', error);
    return [];
  }
};


const App = () => {
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [inputAddress, setInputAddress] = useState('');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permiso para acceder a la ubicación fue denegado');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const debouncedFetchSuggestions = debounce(async (text) => {
    if (text.length > 2) {
      const results = await fetchStreetSuggestions(text, location);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, 300);

  const handleInputChange = (text) => {
    setInputAddress(text);
    debouncedFetchSuggestions(text);
  };

  const handleSuggestionPress = async (suggestion) => {
    console.log('Suggestion pressed:', suggestion);
    setDestination({
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
    setInputAddress(suggestion.display_name);
    setSuggestions([]);
    if (location) {
      console.log('Fetching route from', location, 'to', suggestion);
      const route = await fetchRoute(location, suggestion);
      // console.log('Route received:', route);
      setRouteCoordinates(route);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <StatusBar barStyle="dark-content" />
      
      {/* Cuadro de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Buscar dirección"
          value={inputAddress}
          onChangeText={handleInputChange}
        />
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSuggestionPress(item)} style={styles.suggestionItem}>
                <Text>{item.display_name}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionList}
          />
        )}
      </View>

      {/* Mapa WebView */}
      {location && (
        <WebView
          style={styles.map}
          originWhitelist={['*']}
          source={{
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
                <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
              </head>
              <body>
                <div id="map" style="width: 100%; height: 100vh;"></div>
                <script>
                  var map = L.map('map').setView([${location.latitude}, ${location.longitude}], 13);
                  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19
                  }).addTo(map);

                  var marker = L.marker([${location.latitude}, ${location.longitude}]).addTo(map)
                    .bindPopup('Tu ubicación')
                    .openPopup();

                  ${destination ? `
                  var destMarker = L.marker([${destination.latitude}, ${destination.longitude}]).addTo(map)
                    .bindPopup('Destino').openPopup();

                  // Comprobamos que la ruta tenga al menos dos puntos
                  if (${routeCoordinates.length} > 1) {
                    console.log('Trazando la ruta:', ${JSON.stringify(routeCoordinates)});
                    var latlngs = ${JSON.stringify(routeCoordinates)};
                    var polyline = L.polyline(latlngs, {color: 'blue'}).addTo(map);
                    map.fitBounds(polyline.getBounds());
                  } else {
                    console.error('La ruta no tiene suficientes coordenadas para mostrar un camino válido.');
                  }
                  ` : ''}
                </script>
              </body>
              </html>
            `
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  searchContainer: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  suggestionList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 10,
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default App;