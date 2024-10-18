// MapViewComponent.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';

const MapViewComponent = ({ location, destination, routeCoordinates = [] }) => {
  // Convertimos las coordenadas al formato que espera Leaflet: [[lat, lng], [lat, lng]]
  const formattedRouteCoordinates = routeCoordinates.map(coord => [
    coord.latitude,
    coord.longitude
  ]);
  console.log('Coordenadas formateadas:', formattedRouteCoordinates);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map').setView([${location.latitude}, ${location.longitude}], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Marcador de ubicación actual
        const currentLocation = L.marker([${location.latitude}, ${location.longitude}])
          .addTo(map)
          .bindPopup('Mi ubicación')
          .openPopup();

        ${destination ? `
          // Marcador de destino
          const destinationMarker = L.marker([${destination.latitude}, ${destination.longitude}])
            .addTo(map)
            .bindPopup('Destino');
        ` : ''}

        ${formattedRouteCoordinates.length > 0 ? `
          // Dibujar la ruta
          const routePoints = ${JSON.stringify(formattedRouteCoordinates)};
          const polyline = L.polyline(routePoints, {
            color: 'blue',
            weight: 3,
            opacity: 0.7
          }).addTo(map);
          
          // Ajustar el mapa para mostrar toda la ruta
          map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        ` : ''}

        // Prevenir el scroll del mapa cuando se toca
        map.scrollWheelZoom.disable();
        map.on('focus', () => { map.scrollWheelZoom.enable(); });
        map.on('blur', () => { map.scrollWheelZoom.disable(); });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        style={styles.map}
        source={{ html: htmlContent }}
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
});

export default MapViewComponent;