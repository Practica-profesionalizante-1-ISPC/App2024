import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getGeoapifySuggestions } from '../utils/geoapifyApi';

const SearchBarComponent = ({ searchType, setSearchResult, setIsTyping }) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async () => {
    if (searchText.trim().length > 0) {
      try {
        const results = await getGeoapifySuggestions(searchText);
        setSuggestions(results);
      } catch (error) {
        console.error('Error al buscar:', error);
        setSuggestions([]);
      }
    }
  };

  const handleClear = () => {
    setSearchText('');
    setSuggestions([]);
    setSearchResult(null);
    if (setIsTyping) setIsTyping(false);
  };

  const handleSelect = (suggestion) => {
    const coordinate = {
      latitude: suggestion.lat,
      longitude: suggestion.lon,
    };
    setSearchResult(coordinate);
    setSearchText(suggestion.formatted);
    setSuggestions([]);
    if (setIsTyping) setIsTyping(false);
  };

  return (
    <View style={searchType === 'origin' ? styles.originContainer : styles.destinationContainer}>
      <Text style={styles.searchTypeText}>
        {searchType === 'origin' ? 'Origen' : 'Destino'}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`Buscar ${searchType === 'origin' ? 'origen' : 'destino'}...`}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            if (searchType === 'origin' && setIsTyping) {
              setIsTyping(true);
            }
          }}
        />

        {searchText.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <MaterialIcons name="clear" size={24} color="#666" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <MaterialIcons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sugerencias de búsqueda */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSelect(suggestion)}
            >
              <Text numberOfLines={2}>{suggestion.formatted}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  originContainer: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    zIndex: 2,
  },
  destinationContainer: {
    position: 'absolute',
    top: 120,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  searchTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  clearButton: {
    padding: 10,
  },
  searchButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 25,
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    marginBottom: 5,
    borderRadius: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default SearchBarComponent;
