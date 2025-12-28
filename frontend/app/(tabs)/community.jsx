import React, { useRef } from 'react'; // Ajout de useRef
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  Animated, // Ajout de Animated
  StatusBar, // Ajout de StatusBar
} from 'react-native';
// import { useNavigation } from '@react-navigation/native'; // Commenté car non utilisé
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- Constantes pour l'animation de l'en-tête ---
const HEADER_MIN_HEIGHT = 40;
const HEADER_SCROLL_FADE_END = 80;

// --- Définitions de types/données simulées (Inchangées) ---

const { width } = Dimensions.get('window');

const topScoresData = [
  { id: '1', name: 'Tjega', points: 350, avatar: require('../../assets/images/avatar-tjega.png'), rank: 1, color: '#FF3B30' },
  { id: '2', name: 'Ngon', points: 200, avatar: require('../../assets/images/avatar-ngon.png'), rank: 2, color: '#FF6D64' },
  { id: '3', name: 'Kandem', points: 100, avatar: require('../../assets/images/avatar-kandem.png'), rank: 3, color: '#FF8A83' },
];

const leaderboardData = [
  { id: '1', name: 'Tjega', points: 350, avatar: require('../../assets/images/avatar-tjega.png') },
  { id: '2', name: 'Ngon', points: 200, avatar: require('../../assets/images/avatar-ngon.png') },
  { id: '3', name: 'Kandem', points: 100, avatar: require('../../assets/images/avatar-kandem.png') },
  { id: '4', name: 'Paul', points: 90, avatar: require('../../assets/images/avatar-paul.png') },
  { id: '5', name: 'Amina', points: 85, avatar: null },
  { id: '6', name: 'Félix', points: 50, avatar: require('../../assets/images/avatar-felix.png') },
];

const activityFeedData = [
  { id: 'a1', name: 'Sophie', action: 'a terminé le thème Famille', icon: '🏠', avatar: require('../../assets/images/avatar-sophie.png') },
  { id: 'a2', name: 'Paul', action: 'a atteint 10 jours consécutifs', icon: '🔥', avatar: require('../../assets/images/avatar-paul.png') },
  { id: 'a3', name: 'Amina', action: "a appris 5 nouveaux mots aujourd'hui", icon: '📖', avatar: null },
  { id: 'a4', name: 'Tjega', action: "a terminé l'exercice 'Les Verbes'", icon: '💪', avatar: require('../../assets/images/avatar-tjega.png') },
  { id: 'a5', name: 'Kandem', action: 'a gagné 10 points de défi', icon: '🏆', avatar: require('../../assets/images/avatar-kandem.png') },
];


// --- NOUVEAU COMPOSANT : UserAvatar (Inchangé) ---
const UserAvatar = ({ source, size = 30, style, iconSize = 20, iconColor = '#fff' }) => {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    ...style,
  };

  if (source) {
    return <Image source={source} style={avatarStyle} />;
  }

  return (
    <View style={[avatarStyle, styles.defaultAvatar]}>
      <Feather name="user" size={iconSize} color={iconColor} />
    </View>
  );
};

// --- Composants réutilisables (Inchangés) ---

const PodiumCard = ({ name, points, avatar, color }) => {
  const avatarSize = 60;
  return (
    <View style={[styles.podiumCard, { backgroundColor: color, width: width / 3.5 }]}>
      <UserAvatar
        source={avatar}
        size={avatarSize}
        style={styles.podiumAvatar}
        iconSize={avatarSize * 0.5}
        iconColor='#fff'
      />
      <Text style={styles.podiumName}>{name}</Text>
      <Text style={styles.podiumPoints}>{points} points</Text>
    </View>
  );
};

const LeaderboardItem = ({ name, points, avatar }) => {
  const maxPoints = topScoresData[0].points;
  const progress = (points / maxPoints) * 100;
  const avatarSize = 30;

  return (
    <View style={styles.leaderboardItem}>
      <UserAvatar
        source={avatar}
        size={avatarSize}
        style={styles.leaderboardAvatar}
        iconSize={avatarSize * 0.6}
        iconColor='#444'
      />
      <Text style={styles.leaderboardName}>{name}</Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress > 100 ? 100 : progress}%` }]} />
      </View>
    </View>
  );
};

const ActivityItem = ({ name, action, icon, avatar }) => {
  const avatarSize = 40;

  return (
    <View style={styles.activityItem}>
      <UserAvatar
        source={avatar}
        size={avatarSize}
        style={styles.activityAvatar}
        iconSize={avatarSize * 0.6}
        iconColor='#444'
      />
      <Text style={styles.activityText}>
        <Text style={styles.activityName}>{name}</Text>
        <Text> {action}</Text>
        <Text> {icon}</Text>
      </Text>
    </View>
  );
};

// --- La Page Principale (Community.jsx) - MODIFIÉE ---

export default function Community() {
  const router = useRouter();

  // --- Ajout de la logique d'animation ---
  const scrollY = useRef(new Animated.Value(0)).current;

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
  // --- Fin de la logique d'animation ---

  const goToStatistics = () => {
    router.push('/standalone/stats');
  };

  const renderPodium = () => {
    const [second, first, third] = topScoresData
      .sort((a, b) => a.rank - b.rank)
      .map(item => ({ ...item }));

    return (
      <View style={styles.podiumContainer}>
        <PodiumCard {...third} />
        <PodiumCard {...first} />
        <PodiumCard {...second} />
      </View>
    );
  };

  return (
    // Utilisation de SafeAreaView sans padding, mais avec flex: 1
    <SafeAreaView style={styles.flexOne}>
      <StatusBar barStyle="dark-content" />

      {/* EN-TÊTE FIXE (Petit & Centré) - NOUVEAU */}
      <Animated.View
        style={[styles.smallHeader, { opacity: smallHeaderOpacity }]}
      >
        <Text style={styles.smallHeaderText}>Community</Text>
      </Animated.View>

      {/* MODIFIÉ : ScrollView -> Animated.ScrollView */}
      <Animated.ScrollView
        style={styles.flexOne}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // Ajout des props de défilement pour l'animation
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* NOUVEAU : Wrapper pour animer le grand titre et le sous-titre */}
        <Animated.View style={{ opacity: largeTitleOpacity }}>
          <View style={styles.headerSimplifiedContainer}>
            <Text style={styles.headerTitle}>Community</Text>
          </View>
          <Text style={styles.headerSubtitleScrollable}>Apprends ensemble, progresse ensemble</Text>
        </Animated.View>

        {/* Le reste du contenu (Inchangé) */}
        {renderPodium()}

        <View style={styles.sectionContainer}>
          {leaderboardData.slice(0, 5).map(item => (
            <LeaderboardItem key={item.id} {...item} />
          ))}
        </View>

        <View style={styles.hr} />

        <Text style={styles.sectionTitle}>Fil d'activité</Text>
        <FlatList
          data={activityFeedData}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ActivityItem {...item} />}
          scrollEnabled={false}
          contentContainerStyle={styles.activityFeedList}
        />

        <TouchableOpacity style={styles.statsButton} onPress={goToStatistics}>
          <Text style={styles.statsButtonText}>
            📊 Voir mes statistiques
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// --- Styles Mis à Jour ---

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // --- STYLES AJOUTÉS POUR L'EN-TÊTE ANIMÉ ---
  smallHeader: {
    height: HEADER_MIN_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#fff', // Fond blanc
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Au-dessus de la liste
    borderBottomWidth: 1,
    borderColor: '#eee', // Bordure légère
  },
  smallHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f30707ff', // Couleur du titre
  },
  // --- FIN DES STYLES AJOUTÉS ---

  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    // MODIFIÉ : Ajout du padding pour l'en-tête fixe
    paddingTop: HEADER_MIN_HEIGHT + 10,
  },
  headerSimplifiedContainer: {
    // MODIFIÉ : paddingTop retiré, géré par scrollContent
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  headerSubtitleScrollable: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 20,
  },
  // ... (Autres styles inchangés) ...
  defaultAvatar: {
    backgroundColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 30,
    backgroundColor: '#E01E3C',
    borderRadius: 15,
    padding: 5,
    minHeight: 180,
  },
  podiumCard: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    height: 150,
  },
  podiumAvatar: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  podiumName: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
  },
  podiumPoints: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  leaderboardAvatar: {
    marginRight: 10,
  },
  leaderboardName: {
    width: 80,
    fontWeight: '600',
    color: '#333',
  },
  progressBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#EFEFEF',
    borderRadius: 5,
    marginLeft: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF3B30',
    borderRadius: 5,
  },
  hr: {
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  activityFeedList: {
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityAvatar: {
    marginRight: 15,
  },
  activityText: {
    fontSize: 15,
    color: '#555',
    flexShrink: 1,
  },
  activityName: {
    fontWeight: 'bold',
    color: '#333',
  },
  statsButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  statsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});