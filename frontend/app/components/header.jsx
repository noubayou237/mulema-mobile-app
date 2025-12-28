import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Platform } from "react-native";
// On remplace Ionicons par les icônes nécessaires pour le nouveau design
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
// Si vous n'avez pas installé 'react-native-vector-icons', vous pouvez utiliser
// import { Ionicons } from "@expo/vector-icons"; // pour la cloche et le profil temporairement
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from "../../constants/colors";
import { usePathname } from "expo-router";

// Variables et logique inutilisées dans ce nouveau design fixe mais conservées pour l'exemple
const WELCOME_KEY = "@app_welcome_shown_v1";

export default function Header({
  pageName,
  // NOTE: On utilise l'username pour le 'Welcome'
  username = "Tjega", 
  avatarSource = null,
  initialCoris = 5, // On fixe les Coris à 5 pour le design (comme '05')
  isHome = false,
  style,
}) {
  const pathname = usePathname();
  const router = useRouter();

  // On utilise 'initialCoris' qui est désormais le "badge Coris"
  const [coris, setCoris] = useState(initialCoris);
  // On utilise 1 notification non lue par défaut pour afficher le point rouge
  const [notifCount, setNotifCount] = useState(1); 

  // Ancienne logique de Welcome Message (conservée mais non affichée dans le nouveau design)
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // ... logique d'AsyncStorage et d'animation pour le welcome message si nécessaire ...
    // NOTE: C'est désactivé ici car le design affiche un "Welcome ,Tjega !" permanent.
    global.decreaseCoris = (n = 1) => setCoris((c) => Math.max(0, c - n));
    return () => { try { delete global.decreaseCoris } catch (e) {} };
  }, []);

  // --- LOGIQUE DE NAVIGATION (comme demandé) ---

  const goToProfile = () => {
    // Navigation vers profile_Page.jsx (Assurez-vous que ce chemin est correct dans expo-router)
    router.push('standalone/profile');
  };

  const goToNotifications = () => {
    // Navigation vers notification.jsx (Assurez-vous que ce chemin est correct)
    router.push('standalone/notification');
  };

  return (
    <View style={[styles.container, style]}>
      {/* LEFT & CENTER: Remplacé par le bloc 'Welcome ,Tjega !' et le soulignement */}
      <View style={styles.leftContent}>
        <Text style={styles.welcomeTextCustom}>
          Welcome ,<Text style={{ fontWeight: 'bold' }}>{username}</Text> !
        </Text>
        <View style={styles.redUnderline} />
      </View>
      
      {/* RIGHT: Icônes (Coris, Notification, Profil) - Design "Lessons" */}
      <View style={styles.rightIcons}>
        
        {/* 1. Icône Coris (Chapeau 05) */}
        <View style={styles.badgeContainer}>
          <Image source={require("../../assets/images/colla.png")} style={{ width: 30, height: 30, resizeMode: "contain" }} />
          <Text style={styles.badgeText}>{coris < 10 ? `0${coris}` : coris}</Text>
        </View>

        {/* 2. Icône Notification */}
        <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.notificationIconBtn} 
            onPress={goToNotifications}
        >
          <Icon name="bell-outline" size={24} color="#000" />
          {/* Point rouge pour la notification */}
          {notifCount > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>

        {/* 3. Icône Profile */}
        <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.profileIconBtn} 
            onPress={goToProfile}
        >
          <Icon name="account-circle" size={32} color="#444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // CONTAINER GENERAL (hauteur ajustée pour le nouveau design si nécessaire)
  container: {
    height: 60, // Légèrement réduit pour être plus compact
    paddingHorizontal: 20, // Padding plus large comme dans la page "Lessons"
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between', // Pour séparer la gauche et la droite
    backgroundColor: "#fff",
  },
  
  // --- PARTIE GAUCHE (Welcome + Ligne Rouge) ---
  leftContent: {
    // Aucune taille fixe, prend l'espace nécessaire
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  welcomeTextCustom: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 5,
  },
  redUnderline: {
    height: 2,
    backgroundColor: '#D9534F',
    width: '100%', 
  },

  // --- PARTIE DROITE (Icônes) ---
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120, // Largeur fixe pour aligner les icônes
    justifyContent: 'space-between',
  },
  
  // 1. Coris (Chapeau)
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5, // Ajoute un peu d'espace si les icônes sont trop proches
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

  // 2. Notification
  notificationIconBtn: {
    position: 'relative',
    padding: 5, // Petit padding pour la zone de touche
  },
  notificationDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: '#fff',
  },

  // 3. Profile
  profileIconBtn: {
    padding: 5, // Petit padding pour la zone de touche
  },

  // Nettoyage des styles originaux non utilisés
  // ... (Supprimez les styles left, pageName, center, right, avatarBtn, corisContainer, corisText, iconBtn, badge, badgeText si vous ne les utilisez plus ailleurs) ...
});