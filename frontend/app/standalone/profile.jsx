import {
  View, Text, TouchableOpacity, Image, StyleSheet, Alert,
  Platform, StatusBar, Modal, TextInput, ActivityIndicator,
  ScrollView, Animated, Easing, Dimensions, Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "@/src/context/UserContext";
import { useState, useEffect, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import api from "../../services/api";
import { useTranslation } from "react-i18next";
import "../../src/i18n";

const { width, height } = Dimensions.get("window");

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸", sub: "English" },
  { code: "fr", name: "Français", flag: "🇫🇷", sub: "French" },
];

// ── Animated stat card ─────────────────────────────────────────────────────
const StatCard = ({ number, label, icon, color, delay }) => {
  const mount = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mount, { toValue: 1, duration: 500, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 7, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[p.statCard, { opacity: mount, transform: [{ scale }] }]}>
      <LinearGradient colors={[`${color}18`, `${color}06`]} style={p.statGrad}>
        <View style={[p.statIconWrap, { backgroundColor: `${color}18`, borderColor: `${color}35` }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[p.statNum, { color }]}>{number ?? "–"}</Text>
        <Text style={p.statLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// ── Menu item ─────────────────────────────────────────────────────────────
const MenuItem = ({ icon, iconColor = "#BDBDBD", label, right, onPress, danger, delay = 0 }) => {
  const mount = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 400, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(pressAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(pressAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  return (
    <Animated.View style={{ opacity: mount, transform: [{ translateX: mount.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }, { scale: pressAnim }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1} style={p.menuItem}>
        <View style={[p.menuIconWrap, { backgroundColor: danger ? "rgba(211,47,47,0.08)" : "rgba(180,60,60,0.05)", borderColor: danger ? "rgba(211,47,47,0.2)" : "rgba(180,60,60,0.1)" }]}>
          <Ionicons name={icon} size={20} color={danger ? "#D32F2F" : iconColor} />
        </View>
        <Text style={[p.menuLabel, danger && { color: "#D32F2F" }]}>{label}</Text>
        <View style={{ flex: 1 }} />
        {right ? right : (
          <Ionicons name="chevron-forward" size={16} color="#BDBDBD" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Bottom sheet modal ────────────────────────────────────────────────────
const BottomSheet = ({ visible, onClose, children, title }) => {
  const slideUp = useRef(new Animated.Value(500)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 500, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[bs.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[bs.sheet, { transform: [{ translateY: slideUp }] }]}>
          <LinearGradient colors={["#FAF7F5", "#F5F0EC"]} style={bs.sheetInner}>
            <View style={bs.handle} />
            {title && (
              <View style={bs.titleRow}>
                <Text style={bs.title}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={bs.closeBtn}>
                  <Ionicons name="close" size={20} color="#BDBDBD" />
                </TouchableOpacity>
              </View>
            )}
            {children}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ── Main Profile ──────────────────────────────────────────────────────────
const Profile = () => {
  const router = useRouter();
  const { user, logout, refreshUser, setLanguage } = useUser();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || "fr";

  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [editNameFocused, setEditNameFocused] = useState(false);
  const [editEmailFocused, setEditEmailFocused] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.6)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(headerAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(avatarScale, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
        Animated.timing(avatarAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.22, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1400, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0, duration: 1400, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.5, duration: 1400, useNativeDriver: true }),
        ]),
      ])
    ).start();

    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      const response = await api.get("/user/profile");
      if (response.data.avatar?.imageUrl) {
        let imageUrl = response.data.avatar.imageUrl;
        let fullImageUrl;
        if (imageUrl.includes("r2.cloudflarestorage.com") || imageUrl.includes("public.r2")) {
          const key = imageUrl.split("/").pop().split("?")[0];
          fullImageUrl = `http://192.168.43.125:5001/image/avatars/${key}`;
        } else if (imageUrl.startsWith("http")) {
          fullImageUrl = imageUrl;
        } else if (imageUrl.startsWith("/")) {
          fullImageUrl = `http://192.168.43.125:5001${imageUrl}`;
        } else {
          fullImageUrl = `http://192.168.43.125:5001/uploads/avatars/${imageUrl}`;
        }
        const sep = fullImageUrl.includes("?") ? "&" : "?";
        setProfileImage(`${fullImageUrl}${sep}t=${Date.now()}`);
      }
    } catch (e) { console.log("Profile load err:", e.message); }
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Tu vas quitter Mulema. À bientôt ! 👋",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se déconnecter",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/sign-in");
            } catch (err) {
              Alert.alert("Erreur", "Impossible de se déconnecter.");
            }
          },
        },
      ]
    );
  };

  const handleLanguageChange = async (langCode) => {
    setIsChangingLanguage(true);
    try {
      await setLanguage(langCode);
      setShowLanguageModal(false);
    } catch (e) {
      Alert.alert(t("errors.somethingWentWrong"), "");
    } finally {
      setIsChangingLanguage(false);
    }
  };

  const getCurrentLang = () => LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  const openImagePicker = () => {
    Alert.alert("Photo de profil", "Choisir une option", [
      { text: "📷 Prendre une photo", onPress: launchCamera },
      { text: "🖼️ Depuis la galerie", onPress: launchImageLibrary },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission refusée", "");
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) { setSelectedImage(result.assets[0]); setShowPreview(true); }
  };

  const launchImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission refusée", "");
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) { setSelectedImage(result.assets[0]); setShowPreview(true); }
  };

  const uploadProfilePicture = async () => {
    if (!selectedImage) return;
    setIsUploading(true);
    try {
      const uri = selectedImage.uri;
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      const formData = new FormData();
      formData.append("file", { uri, name: filename || "photo.jpg", type });
      const response = await api.put("/user/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
      if (response.data.imageUrl) {
        let url = response.data.imageUrl;
        if (!url.startsWith("http")) url = `http://192.168.43.125:5001${url.startsWith("/") ? "" : "/uploads/avatars/"}${url}`;
        const sep = url.includes("?") ? "&" : "?";
        setProfileImage(`${url}${sep}t=${Date.now()}`);
      }
      setShowPreview(false);
      setSelectedImage(null);
    } catch (e) {
      Alert.alert(t("errors.uploadFailed"), e.response?.data?.message || e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!editName.trim()) return Alert.alert("Erreur", "Le nom ne peut pas être vide.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) return Alert.alert("Erreur", "Email invalide.");
    setIsSaving(true);
    try {
      await api.put("/user/profile", { name: editName.trim(), email: editEmail.trim() });
      await refreshUser();
      setShowEditModal(false);
    } catch (e) {
      Alert.alert("Erreur", e.response?.data?.message || e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getImageSource = () => profileImage ? { uri: profileImage } : require("../../assets/images/avatar-user.png");
  const displayName = (user?.username || user?.name || "Apprenant").split(" ")[0];
  const initial = displayName[0]?.toUpperCase() || "M";

  const menuSections = [
    {
      title: "Compte",
      items: [
        { icon: "person-outline", iconColor: "#D32F2F", label: t("profile.editProfile"), onPress: () => { setEditName(user?.name || ""); setEditEmail(user?.email || ""); setShowEditModal(true); } },
        { icon: "language-outline", iconColor: "#E57373", label: t("settings.language"), onPress: () => setShowLanguageModal(true), right: (
          <View style={p.langChip}>
            <Text style={p.langChipText}>{getCurrentLang().flag} {getCurrentLang().name}</Text>
          </View>
        )},
      ],
    },
    {
      title: "Préférences",
      items: [
        { icon: "notifications-outline", iconColor: "#E57373", label: t("settings.notifications"), onPress: () => {} },
        { icon: "settings-outline", iconColor: "#C62828", label: t("settings.title"), onPress: () => {} },
        { icon: "help-circle-outline", iconColor: "#EF9A9A", label: t("settings.helpSupport"), onPress: () => {} },
      ],
    },
    {
      title: "",
      items: [
        { icon: "log-out-outline", label: t("profile.logout"), onPress: handleLogout, danger: true },
      ],
    },
  ];

  return (
    <View style={p.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={["#FAF7F5", "#F5F0EC", "#F0E9E4"]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={p.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header bar ── */}
        <Animated.View style={[p.topBar, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
          <TouchableOpacity onPress={() => router.back()} style={p.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#BDBDBD" />
          </TouchableOpacity>
          <Text style={p.pageTitle}>{t("profile.title")}</Text>
          <TouchableOpacity style={p.settingsBtn} onPress={() => {}}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#BDBDBD" />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Avatar block ── */}
        <Animated.View style={[p.avatarBlock, { opacity: avatarAnim, transform: [{ scale: avatarScale }] }]}>
          <View style={p.avatarWrap}>
            <Animated.View style={[p.pulseRing, { transform: [{ scale: pulseAnim }], opacity: pulseOpacity }]} />
            <View style={p.avatarOuter}>
              {profileImage ? (
                <Image source={getImageSource()} style={p.avatarImg} />
              ) : (
                <LinearGradient colors={["#E53935", "#B71C1C"]} style={p.avatarFallback}>
                  <Text style={p.avatarInitial}>{initial}</Text>
                </LinearGradient>
              )}
            </View>
            <TouchableOpacity style={p.cameraBtn} onPress={openImagePicker} activeOpacity={0.85}>
              <LinearGradient colors={["#E53935", "#B71C1C"]} style={p.cameraBtnGrad}>
                <Ionicons name="camera" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={p.userName}>{user?.username || user?.name || "Apprenant"}</Text>
          <Text style={p.userEmail}>{user?.email || ""}</Text>

          <View style={p.levelBadge}>
            <Text style={p.levelBadgeText}>🌍 Apprenant Mulema</Text>
          </View>
        </Animated.View>

        {/* ── Stats ── */}
        <View style={p.statsRow}>
          <StatCard number={user?.totalPrawns || 0} label={t("profile.points")} icon="star" color="#E8A000" delay={100} />
          <StatCard number={0} label={t("profile.completed")} icon="checkmark-circle" color="#D32F2F" delay={200} />
          <StatCard number="–" label={t("profile.rank")} icon="trophy" color="#C62828" delay={300} />
        </View>

        {/* ── Progress banner ── */}
        <Animated.View style={[p.progressBanner, { opacity: avatarAnim }]}>
          <LinearGradient colors={["rgba(211,47,47,0.08)", "rgba(211,47,47,0.02)"]} style={p.progressGrad}>
            <View style={p.progressLeft}>
              <Text style={p.progressTitle}>Niveau actuel</Text>
              <Text style={p.progressSub}>Débutant · 0 / 100 XP</Text>
              <View style={p.progressBarBg}>
                <View style={[p.progressBarFill, { width: "0%" }]} />
              </View>
            </View>
            <View style={p.xpCircle}>
              <Text style={p.xpNum}>0</Text>
              <Text style={p.xpLabel}>XP</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Menu sections ── */}
        {menuSections.map((section, si) => (
          <View key={si} style={p.section}>
            {section.title ? <Text style={p.sectionTitle}>{section.title}</Text> : null}
            <View style={p.sectionCard}>
              {section.items.map((item, ii) => (
                <MenuItem
                  key={ii}
                  {...item}
                  delay={300 + (si * 3 + ii) * 60}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── IMAGE PREVIEW MODAL ── */}
      <BottomSheet visible={showPreview} onClose={() => { setShowPreview(false); setSelectedImage(null); }} title="Aperçu de la photo">
        {selectedImage && (
          <View style={{ alignItems: "center", paddingHorizontal: 24, paddingBottom: 24 }}>
            <View style={bs.previewImgWrap}>
              <Image source={{ uri: selectedImage.uri }} style={bs.previewImg} />
            </View>
            <Text style={bs.previewHint}>Cette photo sera visible sur ton profil.</Text>
            <View style={bs.previewBtns}>
              <TouchableOpacity onPress={() => { setShowPreview(false); setSelectedImage(null); }} style={bs.cancelBtn}>
                <Text style={bs.cancelBtnText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={uploadProfilePicture} disabled={isUploading} style={{ flex: 1, borderRadius: 14, overflow: "hidden" }}>
                <LinearGradient colors={["#E53935", "#B71C1C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={bs.uploadBtn}>
                  {isUploading ? <ActivityIndicator color="#fff" size="small" /> : <><Ionicons name="cloud-upload-outline" size={18} color="#fff" /><Text style={bs.uploadBtnText}>Définir comme photo</Text></>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* ── EDIT PROFILE MODAL ── */}
      <BottomSheet visible={showEditModal} onClose={() => setShowEditModal(false)} title={t("profile.editProfile")}>
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <Text style={bs.fieldLabel}>{t("profile.name")}</Text>
          <View style={[bs.fieldRow, editNameFocused && bs.fieldFocused]}>
            <Ionicons name="person-outline" size={17} color={editNameFocused ? "#D32F2F" : "#BDBDBD"} style={{ marginRight: 10 }} />
            <TextInput style={bs.fieldInput} value={editName} onChangeText={setEditName} placeholder="Ton nom" placeholderTextColor="#C0B8B8" onFocus={() => setEditNameFocused(true)} onBlur={() => setEditNameFocused(false)} />
          </View>

          <Text style={[bs.fieldLabel, { marginTop: 14 }]}>{t("profile.email")}</Text>
          <View style={[bs.fieldRow, editEmailFocused && bs.fieldFocused]}>
            <Ionicons name="mail-outline" size={17} color={editEmailFocused ? "#D32F2F" : "#BDBDBD"} style={{ marginRight: 10 }} />
            <TextInput style={bs.fieldInput} value={editEmail} onChangeText={setEditEmail} placeholder="ton@email.com" placeholderTextColor="#C0B8B8" keyboardType="email-address" autoCapitalize="none" onFocus={() => setEditEmailFocused(true)} onBlur={() => setEditEmailFocused(false)} />
          </View>

          <TouchableOpacity onPress={saveProfile} disabled={isSaving} style={{ marginTop: 24, borderRadius: 16, overflow: "hidden" }}>
            <LinearGradient colors={["#E53935", "#B71C1C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={bs.saveBtn}>
              {isSaving ? <ActivityIndicator color="#fff" size="small" /> : <><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={bs.saveBtnText}>{t("common.save")}</Text></>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* ── LANGUAGE MODAL ── */}
      <BottomSheet visible={showLanguageModal} onClose={() => setShowLanguageModal(false)} title={t("settings.selectLanguage")}>
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          {LANGUAGES.map((lang) => {
            const selected = currentLanguage === lang.code;
            return (
              <TouchableOpacity key={lang.code} onPress={() => handleLanguageChange(lang.code)} disabled={isChangingLanguage} activeOpacity={0.8}>
                <View style={[bs.langOption, selected && bs.langOptionSelected]}>
                  <Text style={bs.langFlag}>{lang.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[bs.langName, selected && { color: "#D32F2F" }]}>{lang.name}</Text>
                    <Text style={bs.langSub}>{lang.sub}</Text>
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={22} color="#D32F2F" />}
                </View>
              </TouchableOpacity>
            );
          })}
          {isChangingLanguage && <ActivityIndicator color="#D32F2F" style={{ marginTop: 12 }} />}
        </View>
      </BottomSheet>
    </View>
  );
};

// ── Profile styles ─────────────────────────────────────────────────────────
const p = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingTop: Platform.OS === "ios" ? 54 : 40, paddingBottom: 20 },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.7)", borderWidth: 1, borderColor: "rgba(180,60,60,0.12)", alignItems: "center", justifyContent: "center" },
  pageTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", letterSpacing: 0.5 },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.7)", borderWidth: 1, borderColor: "rgba(180,60,60,0.12)", alignItems: "center", justifyContent: "center" },

  // Avatar
  avatarBlock: { alignItems: "center", marginBottom: 28, paddingHorizontal: 24 },
  avatarWrap: { position: "relative", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  pulseRing: { position: "absolute", width: 108, height: 108, borderRadius: 54, borderWidth: 2, borderColor: "#D32F2F" },
  avatarOuter: { width: 94, height: 94, borderRadius: 47, overflow: "hidden", borderWidth: 3, borderColor: "rgba(211,47,47,0.5)" },
  avatarImg: { width: "100%", height: "100%", borderRadius: 47 },
  avatarFallback: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 36, fontWeight: "800", color: "#fff" },
  cameraBtn: { position: "absolute", bottom: 2, right: 2, borderRadius: 16, overflow: "hidden", borderWidth: 2.5, borderColor: "#FAF7F5" },
  cameraBtnGrad: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },

  userName: { fontSize: 24, fontWeight: "800", color: "#1A1A1A", letterSpacing: 0.3, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  userEmail: { fontSize: 13, color: "#AAAAAA", marginTop: 4, marginBottom: 12 },
  levelBadge: { backgroundColor: "rgba(211,47,47,0.08)", borderWidth: 1, borderColor: "rgba(211,47,47,0.25)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  levelBadgeText: { color: "#C62828", fontSize: 12, fontWeight: "700" },

  // Stats
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(180,60,60,0.1)" },
  statGrad: { padding: 14, alignItems: "center", gap: 6 },
  statIconWrap: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  statNum: { fontSize: 22, fontWeight: "900" },
  statLabel: { fontSize: 10, color: "#AAAAAA", fontWeight: "600", textAlign: "center" },

  // Progress
  progressBanner: { marginHorizontal: 20, marginBottom: 24, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(211,47,47,0.15)" },
  progressGrad: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  progressLeft: { flex: 1, gap: 6 },
  progressTitle: { fontSize: 14, fontWeight: "700", color: "#2C2C2C" },
  progressSub: { fontSize: 11, color: "#AAAAAA" },
  progressBarBg: { height: 6, backgroundColor: "rgba(180,60,60,0.1)", borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#D32F2F", borderRadius: 3 },
  xpCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(211,47,47,0.08)", borderWidth: 2, borderColor: "rgba(211,47,47,0.25)", alignItems: "center", justifyContent: "center" },
  xpNum: { fontSize: 16, fontWeight: "900", color: "#D32F2F", lineHeight: 18 },
  xpLabel: { fontSize: 9, color: "#AAAAAA", fontWeight: "700" },

  // Menu
  section: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: "700", color: "#BDBDBD", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10, paddingLeft: 4 },
  sectionCard: { backgroundColor: "rgba(255,255,255,0.75)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(180,60,60,0.1)", overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "rgba(180,60,60,0.07)", gap: 14 },
  menuIconWrap: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 15, fontWeight: "500", color: "#2C2C2C", flex: 1 },

  langChip: { backgroundColor: "rgba(211,47,47,0.08)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(211,47,47,0.18)" },
  langChipText: { color: "#C62828", fontSize: 12, fontWeight: "600" },
});

// ── Bottom sheet styles ────────────────────────────────────────────────────
const bs = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: "hidden" },
  sheetInner: { paddingTop: 12 },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: "rgba(180,60,60,0.2)", alignSelf: "center", marginBottom: 20 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "800", color: "#1A1A1A" },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(180,60,60,0.08)", borderWidth: 1, borderColor: "rgba(180,60,60,0.15)", alignItems: "center", justifyContent: "center" },

  // Preview
  previewImgWrap: { width: 180, height: 180, borderRadius: 90, overflow: "hidden", borderWidth: 3, borderColor: "rgba(211,47,47,0.4)", marginBottom: 16 },
  previewImg: { width: "100%", height: "100%" },
  previewHint: { color: "#888", fontSize: 13, marginBottom: 24, textAlign: "center" },
  previewBtns: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, backgroundColor: "rgba(180,60,60,0.06)", borderWidth: 1, borderColor: "rgba(180,60,60,0.15)", alignItems: "center", justifyContent: "center" },
  cancelBtnText: { color: "#888", fontWeight: "600", fontSize: 15 },
  uploadBtn: { paddingVertical: 15, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  uploadBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Fields
  fieldLabel: { color: "#888", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  fieldRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(180,60,60,0.04)", borderRadius: 14, borderWidth: 1.5, borderColor: "rgba(180,60,60,0.12)", paddingHorizontal: 14, paddingVertical: 13 },
  fieldFocused: { borderColor: "#D32F2F", backgroundColor: "rgba(211,47,47,0.06)" },
  fieldInput: { flex: 1, color: "#1A1A1A", fontSize: 15, fontWeight: "500" },
  saveBtn: { paddingVertical: 16, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Lang
  langOption: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(180,60,60,0.1)", padding: 16, marginBottom: 10 },
  langOptionSelected: { borderColor: "rgba(211,47,47,0.35)", backgroundColor: "rgba(211,47,47,0.07)" },
  langFlag: { fontSize: 32 },
  langName: { fontSize: 16, fontWeight: "700", color: "#2C2C2C" },
  langSub: { fontSize: 12, color: "#AAAAAA", marginTop: 2 },
});

export default Profile;