import React, { useRef } from 'react'; // Ajout de useRef
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Animated, // Ajout de Animated
} from 'react-native';
// Importez les icônes nécessaires
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';


// --- Constantes pour l'animation de l'en-tête ---
const HEADER_MIN_HEIGHT = 40;
const HEADER_SCROLL_FADE_END = 80;

// --- Données pour la liste des leçons (20 leçons) ---
const LESSON_DATA = Array.from({ length: 20 }, (_, index) => {
  const lessonNumber = index + 1;
  return {
    id: String(lessonNumber),
    title: `lesson ${lessonNumber}`,
    unlocked: lessonNumber <= 2,
  };
});

// --- Composant pour le rendu de chaque élément de leçon (INCHANGÉ) ---
const LessonItem = ({ item }) => {
  
  const router = useRouter();
  const lessonStyle = item.unlocked ? styles.lessonItem : styles.lessonItemLocked;
  const textStyle = item.unlocked ? styles.lessonText : styles.lessonTextLocked;

  const avatarSource = item.id === '1'
    ? { uri: 'https://i.imgur.com/uR5p0Qz.png' }
    : null;

  return (
    <TouchableOpacity
      style={lessonStyle}
      disabled={!item.unlocked}
      onPress={() => {
        if (item.unlocked) {
          router.push(`/lessons/${item.id}`);  // ← Navigation vers la page
        }
      }}
    >
      <View style={styles.lessonContent}>
        {item.id === '1' && (
          <Image
            source={avatarSource}
            style={styles.avatarLesson}
          />
        )}
        <Text style={[textStyle, item.id === '1' && styles.lessonTextWithAvatar]}>
          {item.title}
        </Text>
      </View>

      {item.unlocked ? (
        <Icon name="chevron-right" size={24} color="#000" />
      ) : (
        <FontAwesome name="lock" size={24} color="#A0A0A0" />
      )}
    </TouchableOpacity>
  );
};

// --- Composant d'En-tête de la Liste (MODIFIÉ) ---
// Prend maintenant 'largeTitleOpacity' en prop pour animer le titre
const ListHeader = ({ largeTitleOpacity }) => (
  <View style={styles.headerContainer}>
    {/* 1. Header (Partie supérieure) - Reste commenté comme dans votre code */}
    {/* <View style={styles.header}> ... </View> */}
    {/* <View style={styles.redUnderline} /> */}

    {/* 2. Titre de la section (MAINTENANT ANIMÉ) */}
    <Animated.Text style={[styles.lessonsTitle, { opacity: largeTitleOpacity }]}>
      Lessons
    </Animated.Text>

    {/* 3. Bloc d'information (INCHANGÉ) */}
    <View style={styles.infoCard}>
      <Text style={styles.cardTitle}>
        Complete this lesson to unlock the next one
      </Text>
      <Text style={styles.cardSubtitle}>
        Step by step, you build your knowledge
      </Text>
    </View>
  </View>
);

// --- Composant principal de la page Leçons (MODIFIÉ) ---
const Lessons = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* EN-TÊTE FIXE (Petit & Centré) - NOUVEAU */}
      <Animated.View
        style={[styles.smallHeader, { opacity: smallHeaderOpacity }]}
      >
        <Text style={styles.smallHeaderText}>lessons</Text>
      </Animated.View>

      {/* 4. Liste des Leçons (MODIFIÉE en Animated.FlatList) */}
      <Animated.FlatList // Changé de FlatList à Animated.FlatList
        data={LESSON_DATA}
        renderItem={({ item }) => <LessonItem item={item} />}
        keyExtractor={item => item.id}
        // Passe la prop d'opacité au Header
        ListHeaderComponent={
          <ListHeader largeTitleOpacity={largeTitleOpacity} />
        }
        contentContainerStyle={styles.lessonsList}
        showsVerticalScrollIndicator={false}
        // Ajout des props de défilement pour l'animation
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />

      {/* 5. Bottom Navigation Bar (INCHANGÉ) - Reste fixe en bas */}
      {/* <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home-outline" size={24} color="#444" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Icon name="book-open-outline" size={24} color="#D9534F" />
          <Text style={styles.activeNavText}>Lessons</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="medal-outline" size={24} color="#444" />
          <Text style={styles.navText}>Excercises</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="account-group-outline" size={24} color="#444" />
          <Text style={styles.navText}>Community</Text>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
};

// --- Stylesheet (MODIFIÉ) ---
const styles = StyleSheet.create({
  container: {
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
    backgroundColor: '#fff', // Fond blanc pour le thème clair
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5, // Au-dessus de la liste
    borderBottomWidth: 1,
    borderColor: '#eee', // Bordure légère
  },
  smallHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f30707ff', // Couleur du titre
  },
  // --- FIN DES STYLES AJOUTÉS ---

  // Conteneur de l'en-tête (MODIFIÉ)
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: HEADER_MIN_HEIGHT + 10, // MODIFIÉ : Ajout du padding pour l'en-tête fixe
  },
  // --- Header Styles (INCHANGÉS) ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '400',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
    justifyContent: 'space-between',
  },
  redUnderline: {
    height: 2,
    backgroundColor: '#D9534F',
    width: '50%',
    marginLeft: 0,
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconHat: {
    transform: [{ rotate: '-15deg' }],
  },
  badgeText: {
    fontSize: 14,
    color: '#D9534F',
    marginLeft: 2,
    fontWeight: 'bold',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: '#fff',
  },
  // --- Title & Card Styles (INCHANGÉS) ---
  lessonsTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  // --- Lesson List Styles (INCHANGÉS) ---
  lessonsList: {
    paddingBottom: 70 + 20, // Espace pour la nav du bas
    paddingHorizontal: 0,
  },
  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: '#FFF',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginHorizontal: 20,
  },
  lessonItemLocked: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: '#FDEAEB',
    marginBottom: 15,
    marginHorizontal: 20,
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLesson: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  lessonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textTransform: 'uppercase',
  },
  lessonTextLocked: {
    fontSize: 18,
    fontWeight: '600',
    color: '#A0A0A0',
    textTransform: 'uppercase',
  },
  lessonTextWithAvatar: {
    fontWeight: 'bold',
  },

  // --- Bottom Navigation Styles (INCHANGÉS) ---
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  navText: {
    fontSize: 12,
    color: '#444',
  },
  activeNavText: {
    fontSize: 12,
    color: '#D9534F',
    fontWeight: 'bold',
  },
});

export default Lessons;