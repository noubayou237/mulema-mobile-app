import React from 'react';
import { useRouter } from 'expo-router';
import { useEffect } from 'react'; // Garde uniquement cette ligne
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';

const { width, height } = Dimensions.get('window');


const EndScreen = ({ navigation, route }) => {
    const router = useRouter();

  // Fonction pour sauvegarder le déblocage
  const unlockNextTheme = async () => {
    try {
      // On enregistre que le thème 2 est débloqué
      await AsyncStorage.setItem('theme2_unlocked', 'true');
      console.log("Theme 2 débloqué !");
    } catch (e) {
      console.error("Erreur lors du déblocage", e);
    }
  };
  // On récupère les stats finales si besoin (pour une logique future)
  // const { finalScore, totalMistakes } = route.params || {};

  const handleRestart = () => {
    // Logique : On retourne au premier exercice pour recommencer
    // On reset les paramètres de navigation si nécessaire
    router.replace("/exercices/famille/exos1");
  };

  const handleNext = () => {
    // Logique : Retour à l'accueil ou à la leçon suivante
    router.dismissAll(); // Vide la pile pour revenir au début
    router.replace("/exercices");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#CD4C58" />
      
      <View style={styles.container}>
        
        {/* --- SECTION HAUTE : MÉDAILLE --- */}
        <View style={styles.topSection}>
          {/* Décorations (Étoiles/Étincelles) - Positionnement absolu simulé */}
          <Text style={[styles.sparkle, { top: 40, left: 60, fontSize: 30 }]}>✨</Text>
          <Text style={[styles.sparkle, { top: 80, right: 60, fontSize: 25 }]}>✨</Text>
          <Text style={[styles.sparkle, { bottom: 20, left: 80, fontSize: 20 }]}>✨</Text>

          {/* Image de la médaille */}
          <View style={styles.medalContainer}>
             {/* Remplacer par <Image source={require('./medal.png')} /> */}
             <Text style={{ fontSize: 120 }}>🏅</Text>
          </View>

          <Text style={styles.congratsText}>félicitations</Text>
        </View>

        {/* --- SECTION CARTE : RÉSULTATS --- */}
        <View style={styles.cardContainer}>
          
          <Text style={styles.sectionTitle}>Section 1 :</Text>
          
          <Text style={styles.themeTitle}>Vie sociale & famille</Text>
          
          <Text style={styles.scoreText}>6 / 6 exercices</Text>

          {/* Ligne "Terminées" avec icône */}
          <View style={styles.statusRow}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.statusText}>Terminées</Text>
          </View>

          <Text style={styles.descriptionText}>
            Tu connais maintenant les mots essentiels pour parler de tes proches.
          </Text>

          {/* --- BOUTONS D'ACTION --- */}
          <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
           <Text style={styles.restartButtonText}>Recommencer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
           <Text style={styles.nextButtonText}>Suivant</Text>
        </TouchableOpacity>
      </View>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#CD4C58', // Rouge clair du fond (pipette sur l'image)
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between', // Répartit l'espace entre le haut et la carte
    paddingVertical: 20,
  },
  // --- Top Section ---
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  sparkle: {
    position: 'absolute',
    color: '#FAD02C', // Jaune doré
    opacity: 0.8,
  },
  medalContainer: {
    marginBottom: 10,
    // Ajoutez ici une ombre ou un style spécifique si vous utilisez une vraie image
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  congratsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FAD02C', // Jaune du texte
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // --- Card Section ---
  cardContainer: {
    backgroundColor: '#9E2A36', // Rouge foncé de la carte
    width: width * 0.9, // 90% de la largeur de l'écran
    borderRadius: 25,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20, // Marge par rapport au bas
    // Ombre de la carte
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  sectionTitle: {
    color: '#E0E0E0',
    fontSize: 16,
    marginBottom: 5,
  },
  themeTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  scoreText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkIcon: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  descriptionText: {
    color: '#E0E0E0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  // --- Buttons ---
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  restartButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  restartButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#9E2A36', // Couleur texte rouge foncé pour le contraste
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EndScreen;