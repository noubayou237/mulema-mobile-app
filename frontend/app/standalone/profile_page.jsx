import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Composant réutilisable pour les champs (avec édition) ---
const ProfileInput = ({ iconName, placeholder, value, onChangeText, editable = true, secureTextEntry = false }) => (
  <View style={styles.inputContainer}>
    <Icon name={iconName} size={20} color="#8A8A8E" style={styles.inputIcon} />
    <TextInput
      style={[styles.textInput, !editable && styles.disabledInput]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#8A8A8E"
      secureTextEntry={secureTextEntry}
      editable={editable}
    />
    {placeholder === 'Mot de passe' && (
      <TouchableOpacity>
        <Icon name="sync-outline" size={20} color="#8A8A8E" />
      </TouchableOpacity>
    )}
  </View>
);

// --- Écran de profil d'édition ---
export default function ProfileEditScreen() { 
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // --- 👨‍💻 BACKEND (Simulation) ---
  const [imageUri, setImageUri] = useState(null);
  const [name, setName] = useState('Anna Avetisyan');
  const [birthday, setBirthday] = useState('01/01/1990');
  const [phone, setPhone] = useState('818 123 4567');
  const [instagram, setInstagram] = useState('aplusdesign.co');
  const [email, setEmail] = useState('info@aplusdesign.co');
  
  const [isLoading, setIsLoading] = useState(false);

  // Demande de permission pour la galerie
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à votre galerie.');
        }
      }
    })();
  }, []);

  // 1. Bouton retour
  const handleGoBack = () => {
    router.back();
  };

  // 2. Sélection d'image 
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      // Logique d'upload d'image ici
    }
  };

  // 3. Sauvegarde des modifications
  const handleUpdateProfile = async () => {
    setIsLoading(true);

    // --- Appel API de sauvegarde ici ---
    
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Succès', 'Le profil a été mis à jour.');
      router.back(); // Retourne à l'écran de visualisation après sauvegarde
    }, 1500);
  };

  return (
    <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 0 : insets.top }}
    >
      {/* --- Header personnalisé --- */}
      <LinearGradient
        colors={['#cb1111ff', '#ad4444ff']}
        style={styles.header}
      >
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Modifier Profil</Text>
        
        {/* --- Avatar --- */}
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image
            style={styles.avatar}
            source={imageUri ? { uri: imageUri } : require('../../assets/images/avatar-ngon.png')} 
          />
          <View style={styles.cameraIcon}>
             <Icon name="camera-outline" size={18} color="#333" />
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* --- Formulaire --- */}
      <View style={styles.formContainer}>
        <ProfileInput
          iconName="person-outline"
          placeholder="Nom complet"
          value={name}
          onChangeText={setName}
        />
        <ProfileInput
          iconName="calendar-outline"
          placeholder="Date de naissance"
          value={birthday}
          onChangeText={setBirthday}
        />
        <ProfileInput
          iconName="call-outline"
          placeholder="Téléphone"
          value={phone}
          onChangeText={setPhone}
        />
        <ProfileInput
          iconName="logo-instagram"
          placeholder="Compte Instagram"
          value={instagram}
          onChangeText={setInstagram}
        />
        <ProfileInput
          iconName="mail-outline"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          editable={false} 
        />
        <ProfileInput
          iconName="eye-outline"
          placeholder="Mot de passe"
          value="**********"
          secureTextEntry={true}
          editable={false} 
        />
      </View>

      {/* --- Bouton de sauvegarde --- */}
      <TouchableOpacity
        style={styles.saveButtonWrapper}
        onPress={handleUpdateProfile}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#cb1111ff', '#ad4444ff']}
          style={styles.saveButton}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Sauvegarder les changements</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- STYLES (Utilise les styles d'édition) ---
const styles = StyleSheet.create({
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
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#F5F5F7',
        borderRadius: 15,
        padding: 4,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    formContainer: {
        marginTop: 65,
        paddingHorizontal: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 15 : 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    disabledInput: {
        color: '#8A8A8E',
    },
    saveButtonWrapper: {
        marginHorizontal: 24,
        marginTop: 20,
        marginBottom: 40,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#cb1111ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    saveButton: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});