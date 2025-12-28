import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Alert, // 💡 Importation pour la confirmation de déconnexion
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo'; // 💡 Importation de useAuth

// --- Composant réutilisable pour afficher une ligne de donnée (INCHANGÉ) ---
const ProfileDisplay = ({ iconName, label, value }) => (
  <View style={styles.displayContainer}>
    <Icon name={iconName} size={20} color="#8A8A8E" style={styles.displayIcon} />
    <View style={styles.displayContent}>
      <Text style={styles.displayLabel}>{label}</Text>
      <Text style={styles.displayValue}>{value}</Text>
    </View>
  </View>
);

// --- Écran de profil principal ---
export default function ProfileViewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // 💡 Hook Clerk pour la déconnexion
  const { signOut } = useAuth(); 
  
  // --- Données de l'utilisateur (à remplacer par le fetch réel) ---
  const [userData] = useState({
    imageUri: null, 
    name: 'Anna Avetisyan',
    birthday: '01/01/1990',
    phone: '818 123 4567',
    instagram: 'aplusdesign.co',
    email: 'info@aplusdesign.co',
  });

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToEdit = () => {
    // Navigation vers le nouvel écran d'édition
    router.push('standalone/profile_page');
  };

  // 💡 NOUVELLE FONCTION : Gestion de la déconnexion avec confirmation
  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, Déconnexion",
          style: "destructive",
          onPress: async () => {
            try {
              // 💡 Appel de la fonction signOut fournie par Clerk
              await signOut(); 
              router.replace("../sign-in");
              // La redirection vers la page de connexion sera gérée par le _layout
            } catch (err) {
              console.error("Erreur de déconnexion:", err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ 
        paddingTop: Platform.OS === 'android' ? 0 : insets.top,
        paddingBottom: insets.bottom + 40, // Assure un espace suffisant en bas
      }}
    >
      {/* --- Header personnalisé (INCHANGÉ) --- */}
      <LinearGradient
        colors={['#cb1111ff', '#ad4444ff']}
        style={styles.header}
      >
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{userData.name || 'Mon Profil'}</Text>
        
        {/* --- Avatar --- */}
        <View style={styles.avatarContainer}>
          <Image
            style={styles.avatar}
            source={userData.imageUri ? { uri: userData.imageUri } : require('../../assets/images/avatar-ngon.png')} 
          />
        </View>
      </LinearGradient>

      {/* --- Contenu affiché (INCHANGÉ) --- */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Informations Personnelles</Text>
        
        <ProfileDisplay 
            iconName="person-outline" 
            label="Nom complet" 
            value={userData.name} 
        />
        <ProfileDisplay 
            iconName="calendar-outline" 
            label="Date de naissance" 
            // label="Date de naissance" 
            value={userData.birthday} 
        />
        <ProfileDisplay 
            iconName="call-outline" 
            label="Téléphone" 
            value={userData.phone} 
        />
        <ProfileDisplay 
            iconName="logo-instagram" 
            label="Instagram" 
            value={userData.instagram} 
        />
        <ProfileDisplay 
            iconName="mail-outline" 
            label="Email" 
            value={userData.email} 
        />
      </View>

      {/* --- Bouton d'édition --- */}
      <TouchableOpacity
        style={styles.editButtonWrapper}
        onPress={handleGoToEdit}
      >
        <LinearGradient
          colors={['#cb1111ff', '#ad4444ff']}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>Modifier le profil</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      {/* 💡 NOUVEAU : Bouton de déconnexion */}
      <TouchableOpacity
        style={[styles.editButtonWrapper, styles.logoutButtonWrapper]} // Utilisation des mêmes styles de wrapper
        onPress={handleLogout}
      >
        <View style={styles.logoutButton}>
          <Icon name="log-out-outline" size={20} color="#cb1111ff" style={{ marginRight: 10 }} />
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
}

// --- STYLES (AJOUT des styles de déconnexion) ---
const styles = StyleSheet.create({
    // ... (Styles existants) ...
    // ...
    editButtonWrapper: {
        marginHorizontal: 24,
        marginTop: 30,
        marginBottom: 10, // Réduit l'espace car on ajoute un autre bouton
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#cb1111ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    editButton: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    
    // 💡 NOUVEAUX STYLES pour le bouton de déconnexion
    logoutButtonWrapper: {
        marginTop: 15,
        marginBottom: 40,
        backgroundColor: '#FFFFFF', // Fond blanc
        borderWidth: 1,
        borderColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    logoutButton: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    logoutButtonText: {
        color: '#cb1111ff', // Texte rouge pour la déconnexion
        fontSize: 16,
        fontWeight: 'bold',
    },
    // ... (Autres styles existants) ...
    container: {
        flex: 1,
        backgroundColor: '#F5F5F7',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 60,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: 60,
        zIndex: 10,
        padding: 5,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    avatarContainer: {
        position: 'absolute',
        bottom: -40,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        borderRadius: 50,
        backgroundColor: '#FFF',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    formContainer: {
        marginTop: 65,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    displayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    displayIcon: {
        marginRight: 15,
    },
    displayContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    displayLabel: {
        fontSize: 14,
        color: '#8A8A8E',
        fontWeight: '500',
    },
    displayValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
});