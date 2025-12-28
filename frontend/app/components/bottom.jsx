import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
// On utilise MaterialCommunityIcons pour unifier les icônes
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; 
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors"; // Gardons COLORS pour la réutilisation

// Couleur rouge spécifique du design
const DESIGN_RED = '#D9534F'; 
const INACTIVE_COLOR = '#444'; // Couleur grise/noire pour le texte inactif

/**
 * BottomNav personnalisé selon le design de la page Lessons.
 * - Utilise router.replace(...) pour naviguer
 * - activeKey : clé actuelle (ex: "lessons")
 */
export default function BottomNav({ activeKey = "exercices" }) {
  const router = useRouter();

  // Mise à jour des icônes pour correspondre au design Lessons.jpg
  const items = [
    { key: "home", label: "Home", iconName: "home-outline" }, // Utiliser MDI ou Ionicons pour le Home
    { key: "lessons", label: "Lessons", iconName: "book-open-outline" }, // Utiliser MDI pour Lessons
    { key: "exercices", label: "Excercises", iconName: "medal-outline" }, // Utiliser MDI pour Exercises/Trophy
    { key: "community", label: "Community", iconName: "account-group-outline" }, // Utiliser MDI pour Community/People
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {items.map((it) => {
          const active = it.key === activeKey;
          const color = active ? DESIGN_RED : INACTIVE_COLOR;
          
          // Déterminer le composant d'icône à utiliser
          let IconComponent = MaterialCommunityIcons;
          if (it.key === 'home') {
            IconComponent = Ionicons; // Gardons l'icône Home de Ionicons ou MDI si vous préférez
          }
          
          return (
            <TouchableOpacity
              key={it.key}
              style={styles.btn}
              activeOpacity={0.85}
              // Conserver la logique de navigation existante
              onPress={() => router.replace(`/${it.key}`)}
            >
              <View style={styles.iconWrapper}>
                {/* Icône */}
                <IconComponent name={it.iconName} size={24} color={color} />
                
                {/* Texte */}
                <Text style={[styles.label, { color }]}>{it.label}</Text>
                
                {/* Ligne rouge active (Indicator) - Seulement si actif */}
                {active && <View style={styles.activeIndicator} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Le wrapper doit être absolu pour rester fixe
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    // Ajuster le bottom si nécessaire, souvent 0 est suffisant si la SafeAreaView est bien utilisée
    bottom: 0, 
    zIndex: 50,
    backgroundColor: '#fff', // Important pour couvrir le contenu derrière
    borderTopWidth: 1,
    borderTopColor: '#eee',
    // Retirer l'ombre pour la remplacer par la ligne de séparation du haut (borderTopWidth)
  },
  container: {
    width:'100%',
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 5,
    justifyContent: "space-around",
    alignItems: "center",
    height: 70, // Hauteur ajustée pour le design
  },
  btn: { 
    flex: 1, 
    alignItems: "center",
    height: '100%',
    justifyContent: 'center',
    paddingTop: 5,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: 'center',
    position: 'relative',
    height: '100%', // Remplir l'espace du bouton
  },
  label: { 
    fontSize: 12, 
    marginTop: 2, // Ajuster la marge pour le design
    fontWeight: "bold", // Le texte est plus gras dans le design
  },
  activeIndicator: {
    // La ligne rouge sous l'icône active
    position: 'absolute',
    bottom: 0,
    height: 3, 
    width: '70%', // Largeur de l'indicateur
    backgroundColor: DESIGN_RED,
    borderRadius: 2, // Coins arrondis pour l'indicateur
  }
});