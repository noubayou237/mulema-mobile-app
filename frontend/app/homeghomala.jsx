import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

// --- Importez vos images locales ---
// Vous devrez créer des images pour les montagnes, les cadenas, etc.
const mountainLarge = require('../assets/images/mountain-large.png'); // La montagne principale
const mountainSmall = require('../assets/images/mountain-small.png'); // La montagne en bas
const lockIcon = require('../assets/images/lock.png'); // Icone de cadenas
// Note: Les autres éléments (forêt, sentier) seront simulés avec des couleurs de fond et des dégradés.

const { width } = Dimensions.get('window');

// --- DONNÉES DES NIVEAUX ---
const LEVELS_DATA = [
  // J'assume que la navigation pour le Niveau I est vers /exercices/exos1.jsx (ou le chemin exact)
  { id: 1, title: 'NIVEAU I', unlocked: true, path: '/exercices/exos1' }, 
  { id: 2, title: 'NIVEAU II', unlocked: false, path: '/levels/ghomala/level2' },
  { id: 3, title: 'NIVEAU III', unlocked: false, path: '/levels/ghomala/level3' },
  { id: 4, title: 'NIVEAU IV', unlocked: false, path: '/levels/ghomala/level4' },
];

// --- Composant Principal Home Ghomalah ---
export default function HomeGhomalah() {
  const router = useRouter();

  // Fonction de navigation unique
  const handleStartLevel = (level) => {
    if (level.unlocked) {
      console.log(`Démarrage du niveau : ${level.title} -> ${level.path}`);
      router.push(level.path); 
    } else {
      console.log(`Le niveau ${level.id} est verrouillé.`);
    }
  };

  // Rendu de la carte de niveau
  const renderLevelCard = (level, index) => {
    const opacityStyle = level.unlocked ? null : styles.lockedContent;
    const isFirstLevel = index === 0;

    return (
      <View key={level.id} style={styles.levelContainer}>
        
        {/* --- CONTENEUR CLICQUABLE (La zone de la montagne/niveau) --- */}
        <TouchableOpacity
            style={[styles.levelCardButton, opacityStyle, { marginTop: isFirstLevel ? 0 : -50 }]}
            onPress={() => handleStartLevel(level)}
            disabled={!level.unlocked}
            activeOpacity={0.8}
        >
            {/* Titre du niveau (pour le Niveau I) */}
            {isFirstLevel && (
                 <View style={styles.levelHeader}>
                    <Text style={styles.levelTitle}>{level.title}</Text>
                    <Text style={styles.levelSubtitle}>
                        Debloquez les niveaux suivant en resolvant les exercices de ceux précédent
                    </Text>
                </View>
            )}

            {/* Éléments visuels spécifiques au thème (Montagnes) */}
            <View style={styles.mapElement}>
                {/* Image de la montagne ou de la plateforme */}
                <Image 
                    source={isFirstLevel ? mountainLarge : mountainSmall} 
                    style={isFirstLevel ? styles.largeMountainImage : styles.smallMountainImage} 
                />
                
                {/* Cadenas si le niveau est verrouillé */}
                {!level.unlocked && (
                    <Image source={lockIcon} style={styles.lockIcon} />
                )}
            </View>
            
             {/* Nom du Niveau (affiché comme un indicateur au centre) */}
             <View style={styles.levelIndicator}>
                 <Text style={styles.levelIndicatorText}>
                    {isFirstLevel ? "START" : `Niveau ${level.id}`}
                 </Text>
             </View>

        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mapContainer}>
        
        {/* L'arrière-plan de la forêt/montagnes lointaines */}
        <View style={styles.forestBackground} />

        {/* --- Rendu des Niveaux --- */}
        {LEVELS_DATA.map(renderLevelCard)}
      </View>
      
      <View style={{ height: 100 }} /> 
    </ScrollView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F7', // Fond clair
  },
  scrollContent: {
    paddingTop: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mapContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative', 
    // Couleur de base pour le bas de la carte (le sol)
    backgroundColor: '#8BC34A', // Vert clair
  },
  
  // --- ARRIÈRE-PLAN FORÊT (Simule les montagnes lointaines) ---
  forestBackground: {
    position: 'absolute',
    width: '100%',
    top: 0,
    bottom: 0,
    // Dégradé pour simuler la profondeur de la forêt
    backgroundColor: '#4CAF50', // Vert moyen
    zIndex: -1, 
    opacity: 0.5,
  },

  // --- CONTENEUR DE NIVEAU ---
  levelContainer: {
    width: '100%',
    minHeight: 250, 
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  
  // 💡 STYLE: La carte clicquable (Représente le niveau et le chemin)
  levelCardButton: {
    width: '100%',
    minHeight: 250, 
    alignItems: 'center',
    position: 'relative',
    // Couleur du sentier (chemin) sur lequel la montagne est posée
    backgroundColor: '#AEEA00', // Vert citron
    borderTopLeftRadius: 100,
    borderBottomRightRadius: 100,
    marginVertical: -10, 
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  lockedContent: {
    opacity: 0.3, // Effet flou/verrouillé
  },

  // --- NIVEAU 1 (HEADER) ---
  levelHeader: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 0,
    zIndex: 2, 
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D9534F', 
    marginBottom: 5,
  },
  levelSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    paddingHorizontal: 30,
  },

  // --- ÉLÉMENTS DE LA CARTE ---
  mapElement: {
    position: 'relative',
    width: '90%',
    height: 120, 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  largeMountainImage: {
    width: 250,
    height: 150,
    position: 'absolute',
    resizeMode: 'contain',
    top: -50, // Positionne la montagne pour chevaucher le bloc
    zIndex: 1,
  },
  smallMountainImage: {
    width: 180,
    height: 100,
    position: 'absolute',
    resizeMode: 'contain',
    top: -30, 
    zIndex: 1,
  },
  lockIcon: {
    width: 40,
    height: 40,
    position: 'absolute',
    zIndex: 10,
    resizeMode: 'contain',
  },

  // 💡 STYLE: Indicateur de niveau (simule le bouton START/Niveau)
  levelIndicator: {
    backgroundColor: '#D9534F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    zIndex: 3,
  },
  levelIndicatorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});