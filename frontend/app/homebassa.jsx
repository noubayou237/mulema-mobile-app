// homebassa.jsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity, // Importé
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

// --- Importez vos images locales ---
const smallPyramid = require('../assets/images/pyramid-small.png');
const largePyramid = require('../assets/images/pyramid-large.png');
const sphinx = require('../assets/images/sphinx.png');
const camel = require('../assets/images/camel.png');
const lockIcon = require('../assets/images/lock.png'); 

const { width } = Dimensions.get('window');

// --- DONNÉES DES NIVEAUX ---
const LEVELS_DATA = [
  // J'assume que la navigation pour le Niveau I est vers /exercices/exos1.jsx (ou le chemin exact)
  { id: 1, title: 'NIVEAU I', unlocked: true, path: '/exercices/exos1' }, 
  { id: 2, title: 'NIVEAU II', unlocked: false, path: '/levels/bassa/level2' },
  { id: 3, title: 'NIVEAU III', unlocked: false, path: '/levels/bassa/level3' },
  { id: 4, title: 'NIVEAU IV', unlocked: false, path: '/levels/bassa/level4' },
];

// --- Composant Principal Home Bassa ---
export default function HomeBassa() {
  const router = useRouter();

  // Fonction de navigation unique (utilisée par le TouchableOpacity)
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
        
        {/* 💡 CONTENEUR CLICQUABLE (remplace la View standardLevelCard) */}
        <TouchableOpacity
            style={[styles.levelCardButton, opacityStyle, { marginTop: isFirstLevel ? 0 : -50 }]}
            onPress={() => handleStartLevel(level)}
            disabled={!level.unlocked}
            activeOpacity={0.8} // Rétroaction visuelle
        >
            {/* --- CONTENU VISUEL INTÉRIEUR --- */}
            
            {/* Titre du niveau (pour le Niveau I) */}
            {isFirstLevel && (
                 <View style={styles.levelHeader}>
                    <Text style={styles.levelTitle}>{level.title}</Text>
                    <Text style={styles.levelSubtitle}>
                        Debloquez les niveaux suivant en resolvant les exercices de ceux précédent
                    </Text>
                </View>
            )}

            {/* Éléments visuels spécifiques au thème (Pyramides, Sphinx, etc.) */}
            <View style={styles.mapElement}>
                {/* Pyramides de fond */}
                <Image source={smallPyramid} style={[styles.pyramidImage, styles.smallPyramidLeft]} />
                <Image source={largePyramid} style={[styles.pyramidImage, styles.largePyramidRight]} />
                
                {/* Éléments spécifiques à chaque niveau si besoin */}
                {isFirstLevel && (
                    <>
                        <Image source={sphinx} style={styles.sphinxImage} />
                        <Image source={camel} style={styles.camelImage} />
                    </>
                )}
                
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
        
        {/* La ligne de carte (chemin marron du désert) */}
        <View style={styles.mapPath} />

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
    backgroundColor: '#F5F5F7',
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
  },
  
  // --- LIGNE DE CARTE (Chemin marron du désert) ---
  mapPath: {
    position: 'absolute',
    width: '100%',
    top: 0,
    bottom: 0,
    backgroundColor: '#D2B48C', // Couleur sable/désert
    zIndex: -1, 
  },

  // --- CONTENEUR DE NIVEAU ---
  levelContainer: {
    width: '100%',
    minHeight: 250, 
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  
  // 💡 NOUVEAU STYLE: La carte clicquable
  levelCardButton: {
    width: '100%',
    minHeight: 250, 
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#C19A6B', // Couleur sable plus foncée pour les plateformes
    borderRadius: 20,
    marginVertical: -10, 
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  pyramidImage: {
    position: 'absolute',
    resizeMode: 'contain',
  },
  smallPyramidLeft: {
    width: 80,
    height: 80,
    left: 20,
    top: 10,
  },
  largePyramidRight: {
    width: 120,
    height: 120,
    right: 10,
    bottom: 0,
  },
  sphinxImage: {
    width: 100,
    height: 60,
    position: 'absolute',
    left: width * 0.15,
    bottom: 0,
    resizeMode: 'contain',
  },
  camelImage: {
    width: 80,
    height: 50,
    position: 'absolute',
    right: width * 0.1,
    top: 20,
    resizeMode: 'contain',
  },
  lockIcon: {
    width: 40,
    height: 40,
    position: 'absolute',
    zIndex: 10,
    resizeMode: 'contain',
  },

  // 💡 NOUVEAU STYLE: Indicateur de niveau (simule le bouton START/Niveau)
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