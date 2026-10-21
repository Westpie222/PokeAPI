import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import {Audio} from 'expo-av';

interface PokeApiResult {
  name: string;
  url: string;
}

interface PokeApiResponse {
  results: PokeApiResult[];
}

interface PokemonItem {
  id: string;
  name: string;
  image: string;
  sound: string;
}

export default function App() {
  const [pokemon, setPokemon] = useState<PokemonItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPokemon = async (): Promise<void> => {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100&offset=0');
      const data: PokeApiResponse = await response.json();

      const pokemonList: PokemonItem[] = data.results.map((poke: PokeApiResult) => {
        const id = poke.url.split('/')[6];
        return {
          id: id,
          name: poke.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          sound: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`,
        };
      });

      setPokemon(pokemonList);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener los Pokémon:', error);
      setLoading(false);
    }
  };
  const playSound = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.error('Error al reproducir audio:', error);
    }
  };

  useEffect(() => {
    fetchPokemon();
  }, []);

  if (loading) {
    return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E3350D" />
          <Text style={{ marginTop: 10 }}>Cargando Pokédex...</Text>
        </View>
    );
  }

  return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Pokédex</Text>
        <FlatList
            data={pokemon}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
                <View style={styles.card}>
                  <Image source={{ uri: item.image }} style={styles.image} />
                  <Text style={styles.name}>{item.name}</Text>

                  <TouchableOpacity
                      style={styles.button}
                      onPress={() => playSound(item.sound)}
                  >
                    <Text style={styles.buttonText}>🔊 Escuchar</Text>
                  </TouchableOpacity>
                </View>
            )}
        />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 8,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
  },
  name: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: '#333',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#E3350D',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});