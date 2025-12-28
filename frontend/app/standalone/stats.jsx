import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import du package d'icônes MaterialCommunityIcons
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useRouter } from 'expo-router'; 

// --- Configuration et Données ---
const { width } = Dimensions.get('window');

// Données simulées pour le graphique
const progressionData = [
  // REMARQUE : Les chemins des images doivent être corrects dans votre arborescence
  { label: 'Famille', value: 24, avatar: require('../../assets/images/avatar-famille.png') },
  { label: 'Cuisine', value: 18, avatar: require('../../assets/images/avatar-cuisine.webp') }, 
  { label: 'Vêtements', value: 14, avatar: require('../../assets/images/avatar-vetement.png') }, 
];

const totalProgress = 30; 
const currentStreak = 12; 

// --- Composants des Cartes ---

/**
 * 1. Carte Objectifs (Cercle de progression) - Design final
 */
const GoalCard = ({ percentage }) => {
  return (
    <View style={styles.card}>
      <View style={styles.goalContent}>
        <View style={styles.doughnutWrapper}>
          <View style={[styles.doughnutInner]} />
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
        <Text style={styles.goalText}>des objectifs atteints cette semaine</Text>
      </View>
    </View>
  );
};

/**
 * 2. Carte Série de Jours (Barre de progression)
 */
const StreakCard = ({ current, total }) => {
  const progress = (current / total) * 100;
  return (
    <View style={styles.card}>
      <View style={styles.streakHeader}>
        <Icon name="fire" size={20} color="#FF3B30" style={styles.iconMargin} /> 
        <Text style={styles.cardTitle}>Série de jours : {current}</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <View style={styles.streakFooter}>
        <Text style={styles.streakCountMin}>7 jours</Text>
        <Text style={styles.streakCountMax}>30 jours</Text>
      </View>
    </View>
  );
};

/**
 * 3. Carte Progression Détaillée (Graphique Linéaire Simulé)
 */
const DetailedProgressCard = ({ data }) => {
  // Calcul pour la simulation des points
  const allValues = data.map(item => item.value);
  const maxValue = Math.max(...allValues);
  const minValue = 10; 
  
  const points = data.map((item, index) => {
    // Les positions sont calculées en % de la hauteur du graphique
    const normalizedY = 1 - (item.value - minValue) / (maxValue - minValue + 1e-9); 
    const x = (index / (data.length - 1)) * 100; 
    const y = normalizedY * 80; 
    return { x, y: y + 10 }; 
  });
  
  return (
    <View style={[styles.card, { paddingBottom: 0 }]}>
      <Text style={styles.cardTitle}>Progression détaillée</Text>
      
      {/* Zone du graphique */}
      <View style={styles.chartArea}>
        <View style={styles.chartLineBackground} /> 
        
        {/* Points sur la ligne */}
        {points.map((p, index) => (
          <View key={index} style={[
            styles.dataPointContainer, 
            { left: `${p.x}%`, bottom: `${p.y - 10}%` }
          ]}>
            <View style={styles.dataPoint} />
          </View>
        ))}
      </View>
      
      {/* Légendes et Avatars */}
      <View style={styles.chartLabels}>
        {data.map((item, index) => (
          <View key={index} style={styles.chartLabelItem}>
            <Image 
              source={item.avatar} 
              style={styles.labelAvatarImage} 
              onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
            />
            <Text style={styles.labelValue}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * 4. Carte Objectif Quotidien
 */
const DailyGoalCard = ({ goal, completed }) => {
  return (
    <View style={[styles.card, styles.dailyGoalCardBackground]}>
      <View style={styles.dailyGoalContent}>
        <View>
          <Text style={styles.cardTitle}>Ton objectif du jour</Text>
          {/* Le texte Apprends **10 mots** est affiché dans l'image comme un seul bloc */}
          <Text style={styles.dailyGoalText}>Apprends {goal} mots</Text>
          <Text style={styles.dailyGoalCompleted}>déjà {completed}/{goal} faits</Text>
        </View>
        <Icon name="trophy" size={100} color="#ffcc00ff" /> 
      </View>
    </View>
  );
};


// --- La Page Principale (Statistiques.jsx) ---

export default function Statistiques() {
  const router = useRouter();

  const goToCommunity = () => {
    // Navigation vers la page Community (supposée être dans le Tab Navigator)
    router.replace('/(tabs)/community'); 
  };

  return (
    <SafeAreaView style={styles.flexOne} edges={['top']}>
      
      {/* Header : My stats et icônes */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Mes statistiques</Text> 
         
      </View>
      
      {/* --- Contenu Scrollable --- */}
      <ScrollView
        style={styles.flexOne}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        <GoalCard percentage={78} />
        <StreakCard current={currentStreak} total={totalProgress} />
        <DetailedProgressCard data={progressionData} />
        <DailyGoalCard goal={10} completed={7} />

        {/* Bouton Retour */}
        <TouchableOpacity style={styles.returnButton} onPress={goToCommunity}>
          <Text style={styles.returnButtonText}>Retour</Text>
        </TouchableOpacity>

        {/* Espace pour le scroll et la BottomBar */}
        <View style={{ height: 40 }} /> 
      </ScrollView>
      
    </SafeAreaView>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Header simple
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Styles pour les icônes MaterialCommunityIcons dans le header
  chipIcon: {
    marginRight: 2,
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    marginRight: 10,
    fontWeight: '600',
  },
  bellIcon: {
    marginRight: 10,
  },
  iconMargin: {
      marginRight: 5,
  },
  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000ff',
    marginBottom: 0,
  },
  // 1. Goal Card (Doughnut) - Simulé
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doughnutWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    // Simule la bague extérieure rouge
    backgroundColor: '#F0F0F0', 
    borderWidth: 10,
    borderColor: '#FF3B30', 
    overflow: 'hidden',
  },
  doughnutInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    position: 'absolute',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF3B30',
    position: 'absolute',
    zIndex: 1,
  },
  goalText: {
    flex: 1,
    fontSize: 18,
    color: '#555',
    lineHeight: 25,
  },
  // 2. Streak Card
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF3B30',
    borderRadius: 5,
  },
  streakFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -5,
  },
  streakCountMin: {
    fontSize: 14,
    color: '#888',
  },
  streakCountMax: {
    fontSize: 14,
    color: '#888',
  },
  // 3. Detailed Progress Card (Graphique)
  chartArea: {
    height: 150,
    width: '100%',
    marginBottom: 20,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  chartLineBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%', 
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 10,
  },
  dataPointContainer: {
    position: 'absolute',
    width: 10,
    height: 10,
    alignItems: 'center',
    transform: [{ translateX: -5 }],
  },
  dataPoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#fff',
    
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  chartLabelItem: {
    alignItems: 'center',
    width: '33%',
  },
  labelAvatarImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 5,
  },
  labelValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
  },
  // 4. Daily Goal Card
  dailyGoalCardBackground: {
    backgroundColor: 'rgba(255, 255, 255)',
  },
  dailyGoalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyGoalText: {
    fontSize: 18,
    color: '#000000ff',
    fontWeight: '600',
    marginTop: 5,
  },
  dailyGoalCompleted: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 2,
    fontWeight: 'bold',
  },
  // Bouton Retour
  returnButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 40,
  },
  returnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});