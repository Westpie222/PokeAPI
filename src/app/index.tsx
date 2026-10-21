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
import { Audio } from 'expo-av';

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
  types: string[];
  altura: number;
}

const TYPE_COLORS: { [key: string]: string } = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
  grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
  ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705898',
  steel: '#B7B7CE', fairy: '#D685AD',
};

export default function App() {
  const [pokemon, setPokemon] = useState<PokemonItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPokemon = async (): Promise<void> => {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100&offset=0');
      const data: PokeApiResponse = await response.json();

      const detailedPokemonList = await Promise.all(
          data.results.map(async (poke: PokeApiResult) => {
            const id = poke.url.split('/')[6];

            const detailResponse = await fetch(poke.url);
            const detailData = await detailResponse.json();

            const types = detailData.types.map((t: any) => t.type.name);

            console.log(poke.name, detailData.height);

            return {
              id: id,
              name: poke.name,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
              sound: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`,
              types: types,
              altura: detailData.height /10,
            };
          })
      );

      setPokemon(detailedPokemonList);
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

                  <View style={styles.typesContainer}>
                    {item.types?.map((type, index) => (
                        <View
                            key={index}
                            style={[
                              styles.typeBadge,
                              { backgroundColor: TYPE_COLORS[type] || '#777' }
                            ]}
                        >
                          <Text style={styles.typeText}>{type}</Text>
                        </View>
                    ))}
                  </View>
                  <Text> Altura: {item.altura} m</Text>

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
  // Nuevos estilos para los tipos
  typesContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
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