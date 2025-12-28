import React from 'react';
import { useRouter } from 'expo-router'; // 💡 Importez useRouter
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ScrollView 
} from 'react-native';

const { width, height } = Dimensions.get('window');

// --- FONCTIONS FACTICES (A REMPLACER PAR VOTRE LOGIQUE) ---

const playAudio = (pronoun) => {
  // Utilisez expo-av ou react-native-sound ici
  console.log(`🔊 Lecture du son pour : ${pronoun}`);
};

// --- COMPOSANT PRINCIPAL ---

const LessonTwoScreen = () => { // 💡 Retirez { navigation }
  const router = useRouter(); // 💡 Utilisez useRouter
    
  // 💡 LOGIQUE DE NAVIGATION :
  const handleContinue = () => {
    console.log("➡️ Navigation vers la page de leçons suivante.");
    
    // Définir un jeton ou un état pour indiquer que la leçon 2 a été terminée
    const lessonTwoCompleted = true; 

    // Naviguez vers la page lessons.jsx (que nous supposons être /lessons)
    // et passez un paramètre pour débloquer le contenu.
    router.push({
      pathname: "/lessons", // 💡 ASSUMONS QUE LESSONS.JSX EST DANS LA ROUTE /lessons
      params: {
        unlockedLesson: 'lesson3', // Jeton pour débloquer le contenu après la leçon 2
        lessonTwoDone: lessonTwoCompleted, // Jeton de confirmation
      }
    });
  };

  // Données basées sur l'image fournie
  const pronouns = [
    { label: 'Moi', audioKey: 'moi' },
    { label: 'Toi', audioKey: 'toi' },
    { label: 'lui', audioKey: 'lui' }, 
    { label: 'Nous', audioKey: 'nous' },
    { label: 'Vous', audioKey: 'vous' },
    { label: 'Eux', audioKey: 'eux' },
  ];

  const renderPronounButton = (item) => (
    <View key={item.label} style={styles.gridItemContainer}>
      {/* Zone tactile grise pour l'audio */}
      <TouchableOpacity
        style={styles.audioBox}
        onPress={() => playAudio(item.audioKey)}
        activeOpacity={0.7}
      >
        {/* Placeholder visuel (optionnel) */}
      </TouchableOpacity>

      {/* Texte sous le bouton */}
      <Text style={styles.label}>{item.label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainContainer}>
          
          {/* --- HEADER --- */}
          <View style={styles.headerContainer}>
            <Text style={styles.lessonTitle}>Lesson Two</Text>
            <View style={styles.redLine} />
          </View>

          {/* --- CONTENU PRINCIPAL --- */}
          <View style={styles.contentContainer}>
            <Text style={styles.mainHeader}>Personal Pronouns</Text>
            <Text style={styles.subHeader}>
              Tap the button to hear the translation
            </Text>

            {/* Illustration du personnage (Placeholder) */}
            <View style={styles.characterContainer}>
              <Text style={{ fontSize: 60 }}>👴🏾</Text>
            </View>

            <Text style={styles.instructionSmall}>
              Repeat after the audio to practice
            </Text>

            {/* --- GRILLE DES PRONOMS --- */}
            <View style={styles.gridContainer}>
              {pronouns.map((item) => renderPronounButton(item))}
            </View>

            {/* --- BOUTON CONTINUE --- */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue} // 💡 Appel sans 'navigation'
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30, 
  },
  // --- Styles Header ---
  headerContainer: {
    marginBottom: 20,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '800', // Extra Bold
    color: '#C81E2F', // Rouge foncé similaire à l'image
    marginBottom: 5,
  },
  redLine: {
    height: 4,
    backgroundColor: '#C81E2F',
    width: '100%', // Prend toute la largeur comme sur l'image
    borderRadius: 2,
  },
  // --- Styles Contenu ---
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  mainHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  characterContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  instructionSmall: {
    fontSize: 12,
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  // --- Styles Grille ---
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  gridItemContainer: {
    width: '47%', // Permet d'avoir 2 éléments par ligne avec un espace au milieu
    marginBottom: 20,
    alignItems: 'center',
  },
  audioBox: {
    width: '100%',
    height: 60, // Hauteur des rectangles gris
    backgroundColor: '#C4C4C4', // Gris similaire à l'image
    borderRadius: 15, // Coins arrondis
    marginBottom: 8,
    // Ombre légère pour le relief (optionnel)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  // --- Style Bouton Continue ---
  continueButton: {
    backgroundColor: '#C81E2F',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginTop: 20,
    shadowColor: '#C81E2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LessonTwoScreen;