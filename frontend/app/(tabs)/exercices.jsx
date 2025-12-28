import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'avoir installé @expo/vector-icons

// --- Données pour les cartes d'exercice ---
const exerciseData = [
  {
    id: '1',
    title: 'VIE SOCALE & FAMILLE',
    description:
      'Apprends à nommer les membres de la famille et à parler de tes proches avec les bons mots',
    locked: false,
    route: '/exercices/famille/exos1', // Exemple de route
  },
  {
    id: '2',
    title: 'CUISINE',
    description:
      'Découvre le vocabulaire de la cuisine, des repas et des aliments pour parler comme un vrai gourmet',
    locked: true,
    route: '/exercices/cuisine',
  },
  {
    id: '3',
    title: 'VÊTEMENTS',
    description:
      'Entraîne-toi à reconnaître et utiliser le vocabulaire des habits et accessoires du quotidien',
    locked: true,
    route: '/exercices/vetements',
  },
  {
    id: '4',
    title: 'FAUNE & FLORE',
    description:
      'Entraîne-toi à reconnaître et utiliser le vocabulaire des...',
    locked: true,
    route: '/exercices/faune',
  },
];

// --- Hauteur de l'en-tête fixe ---
const HEADER_MIN_HEIGHT = 40;
// --- Point de défilement où l'animation se termine ---
const HEADER_SCROLL_FADE_END = 80;

/**
 * Composant de carte réutilisable
 */
const ExerciseCard = ({ title, description, locked, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.cardContainer, locked && styles.cardLocked]}
      onPress={onPress}
      disabled={locked}
      activeOpacity={0.8}
    >
      {/* Icône de verrouillage */}
      {locked && (
        <Ionicons name="lock-closed" size={20} style={styles.lockIcon} />
      )}

      {/* Contenu texte */}
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
        <Text style={styles.cardButtonText}>Commencer</Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Composant principal de la page
 */
export default function ExercicesScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Gère la navigation
  const handleCardPress = (item) => {
    if (!item.locked) {
      router.push(item.route);
    }
  };

  // --- Animations ---

  // Opacité du petit en-tête (centré)
  const smallHeaderOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_FADE_END / 2, HEADER_SCROLL_FADE_END],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Opacité du grand titre (à gauche)
  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_FADE_END / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // --- Composants de Rendu ---

  // Affiche le grand titre et l'intro en haut de la liste
  const renderListHeader = () => (
    <View style={styles.listHeaderContainer}>
      <Animated.Text style={[styles.largeTitle, { opacity: largeTitleOpacity }]}>
        Exercises
      </Animated.Text>
      <Text style={styles.introText}>
        Choisis un thème et entraîne-toi à apprendre de nouveaux mots et
        expressions. Plus tu pratiques, plus tu progresses !
      </Text>
    </View>
  );

  // Affiche une carte d'exercice
  const renderCardItem = ({ item }) => (
    <ExerciseCard
      title={item.title}
      description={item.description}
      locked={item.locked}
      onPress={() => handleCardPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* EN-TÊTE FIXE (Petit & Centré)
        Apparaît au défilement 
      */}
      <Animated.View
        style={[styles.smallHeader, { opacity: smallHeaderOpacity }]}
      >
        <Text style={styles.smallHeaderText}>Exercises</Text>
      </Animated.View>

      {/* LISTE SCROLLABLE
        Contient le grand titre et les cartes 
      */}
      <Animated.FlatList
        data={exerciseData}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        // Style du contenu de la liste (padding)
        contentContainerStyle={styles.listContentContainer}
        // Événement de défilement pour piloter l'animation
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',// Fond sombre
    
  },
  // --- En-tête (petit, centré) ---
  smallHeader: {
    height: HEADER_MIN_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#ffffffff', // Un peu plus clair que le fond
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Pour être au-dessus de la liste
    borderBottomWidth: 2,
    borderColor: '#ffffffff',
    
  },
  smallHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f30707ff',
  },
  // --- Contenu de la liste ---
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30, // Espace en bas
  },
  listHeaderContainer: {
    paddingTop: HEADER_MIN_HEIGHT + 10, // Démarrer le contenu SOUS l'en-tête fixe
    marginBottom: 10,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 16,
  },
  introText: {
    fontSize: 16,
    color: '#000000ff', // Gris clair
    lineHeight: 22,
    marginBottom: 20,
  },
  // --- Carte d'exercice ---
  cardContainer: {
    backgroundColor: '#C83A44', // Rouge de l'image
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden', // Pour les coins arrondis
  },
  cardLocked: {
    opacity: 0.6, // Griser la carte si verrouillée
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'white',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  lockIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    color: 'white',
  },
});