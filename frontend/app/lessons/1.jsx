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
  ScrollView, // 💡 Ajout de ScrollView pour l'accessibilité
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Remplacez cette fonction par la logique réelle de lecture audio (par exemple, avec 'expo-av')
const playAudio = (day) => {
  console.log(`Lecture de l'audio pour : ${day}`);
  // Insérez ici le code pour jouer le fichier audio correspondant
};

const LessonOneScreen = () => {
  const router = useRouter(); // 💡 Utilisation du hook useRouter

  // 💡 NOUVELLE FONCTION handleContinue avec navigation Router
  const handleContinue = () => {
    console.log('Naviguer vers la page de leçons principale.');
    // Naviguez vers la page lessons.jsx (assumant que le chemin est /lessons)
    router.push('/lessons'); 
  };
  
  // Les données pour les jours de la semaine
  const days = [
    { english: 'Monday', audioKey: 'lundi' },
    { english: 'Tuesday', audioKey: 'mardi' },
    { english: 'Wednesday', audioKey: 'mercredi' },
    { english: 'Thursday', audioKey: 'jeudi' },
    { english: 'Friday', audioKey: 'vendredi' },
    { english: 'Saturday', audioKey: 'samedi' },
    { english: 'Sunday', audioKey: 'dimanche' },
  ];

  const renderDayButton = (dayData) => (
    <View key={dayData.english} style={styles.dayPairContainer}>
      {/* Bouton audio (zone grisée) */}
      <TouchableOpacity
        style={styles.audioButton}
        onPress={() => playAudio(dayData.audioKey)}
      >
        <Text style={styles.audioPlaceholderText}>
          {dayData.audioKey.toUpperCase()}
        </Text>
      </TouchableOpacity>

      {/* Libellé du jour en anglais */}
      <Text style={styles.dayLabel}>{dayData.english}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      {/* 💡 Utilisation de ScrollView pour les petits écrans */}
      <ScrollView contentContainerStyle={styles.scrollContent}> 
        <View style={styles.container}>
          {/* Titre de la Leçon */}
          <Text style={styles.lessonTitle}>Lesson One</Text>
          <View style={styles.headerLine} />

          {/* Contenu principal */}
          <View style={styles.contentContainer}>
            <Text style={styles.mainHeader}>The Day of the week</Text>
            <Text style={styles.instructionText}>
              Tap the button to hear the translation
            </Text>

            {/* Illustration de l'enseignant */}
            <View style={styles.teacherImageContainer}>
              <Text style={{ fontSize: 40 }}>👨🏾‍🏫</Text>
            </View>

            <Text style={styles.instructionTextSmall}>
              Repeat after the audio to pratice
            </Text>

            {/* Bloc des jours de la semaine (lignes de deux) */}
            <View style={styles.daysGrid}>
              {/* Jours 1 à 6 */}
              {days.slice(0, 6).map((day, index) => (
                <React.Fragment key={day.english}>
                  {renderDayButton(day)}
                  {(index + 1) % 2 === 0 && <View style={styles.spacer} />}
                </React.Fragment>
              ))}

              {/* Jour 7 (Dimanche - bouton unique) */}
              <View style={styles.dayPairContainerFull}>
                {renderDayButton(days[6])}
              </View>
            </View>

            {/* Bouton Continuer */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue} // 💡 Appel de la fonction router
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
  scrollContent: { // 💡 Nouveau style pour ScrollView
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingTop: 10,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headerLine: {
    height: 3,
    width: '30%',
    backgroundColor: 'red',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: width * 0.02,
  },
  mainHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 15,
  },
  teacherImageContainer: {
    marginVertical: 10,
    height: 100, 
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionTextSmall: {
    fontSize: 12,
    color: 'gray',
    marginTop: 10,
    marginBottom: 20,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayPairContainer: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 15,
    
  },
  dayPairContainerFull: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    
  },
  audioButton: {
    backgroundColor: '#D3D3D3',
    height: 50,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPlaceholderText: {
    color: '#808080',
    fontSize: 12,
  },
  dayLabel: {
    marginTop: 5,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  spacer: {
    width: '4%',
  },
  continueButton: {
    backgroundColor: '#C81E2F', 
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 30, // Espace fixe avant le bouton
    marginBottom: 20,
    width: '60%', 
    alignSelf: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LessonOneScreen;