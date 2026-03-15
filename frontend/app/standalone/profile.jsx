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

// ── Design tokens ──────────────────────────────────────────────────────────
const BG        = "#F0EDE6";
const CARD_BG   = "#FFFFFF";
const RED       = "#D32F2F";
const RED_LIGHT = "#FFEBEE";
const TEXT_DARK  = "#2C2C2C";
const TEXT_MID   = "#6B6B6B";
const TEXT_LIGHT = "#AAAAAA";
const BORDER     = "#E8E3DC";
const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.07,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 4,
};

const LANGUAGES = [
  { code: "en", name: "English",  flag: "🇺🇸", sub: "English" },
  { code: "fr", name: "Français", flag: "🇫🇷", sub: "French"  },
];

// ── Stat card ──────────────────────────────────────────────────────────────
const StatCard = ({ number, label, icon, color, delay }) => {
  const mount = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mount, { toValue: 1, duration: 450, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 65, friction: 7, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[p.statCard, { opacity: mount, transform: [{ scale }] }]}>
      <View style={[p.statIconWrap, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[p.statNum, { color }]}>{number ?? "–"}</Text>
      <Text style={p.statLabel}>{label}</Text>
    </Animated.View>
  );
};

// ── Menu item ──────────────────────────────────────────────────────────────
const MenuItem = ({ icon, iconBg, iconColor = TEXT_LIGHT, label, right, onPress, danger, delay = 0, isLast }) => {
  const mount     = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(mount, {
      toValue: 1, duration: 380, delay,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(pressAnim, { toValue: 0.97, duration: 75, useNativeDriver: true }),
      Animated.timing(pressAnim, { toValue: 1,    duration: 100, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  return (
    <Animated.View style={[
      { opacity: mount, transform: [{ scale: pressAnim }] },
      !isLast && p.menuItemBorder,
    ]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={p.menuItem}>
        <View style={[p.menuIconWrap, { backgroundColor: danger ? RED_LIGHT : (iconBg || "#F5F3F0") }]}>
          <Ionicons name={icon} size={19} color={danger ? RED : iconColor} />
        </View>
        <Text style={[p.menuLabel, danger && { color: RED, fontWeight: "600" }]}>{label}</Text>
        <View style={{ flex: 1 }} />
        {right ?? <Ionicons name="chevron-forward" size={15} color={TEXT_LIGHT} />}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Bottom sheet ───────────────────────────────────────────────────────────
const BottomSheet = ({ visible, onClose, children, title }) => {
  const slideUp = useRef(new Animated.Value(500)).current;
  const fade    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 0,   duration: 200, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 500, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[bs.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[bs.sheet, { transform: [{ translateY: slideUp }] }]}>
          <View style={bs.sheetInner}>
            <View style={bs.handle} />
            {title && (
              <View style={bs.titleRow}>
                <Text style={bs.title}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={bs.closeBtn}>
                  <Ionicons name="close" size={18} color={TEXT_MID} />
                </TouchableOpacity>
              </View>
            )}
            {children}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ── Main Profile ───────────────────────────────────────────────────────────
const Profile = () => {
  const router = useRouter();
  const { user, logout, refreshUser, setLanguage } = useUser();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || "fr";

  const [profileImage,       setProfileImage]       = useState(null);
  const [isUploading,        setIsUploading]        = useState(false);
  const [selectedImage,      setSelectedImage]      = useState(null);
  const [showPreview,        setShowPreview]        = useState(false);
  const [showEditModal,      setShowEditModal]      = useState(false);
  const [editName,           setEditName]           = useState(user?.name || "");
  const [editEmail,          setEditEmail]          = useState(user?.email || "");
  const [isSaving,           setIsSaving]           = useState(false);
  const [showLanguageModal,  setShowLanguageModal]  = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [editNameFocused,    setEditNameFocused]    = useState(false);
  const [editEmailFocused,   setEditEmailFocused]   = useState(false);

  const headerAnim  = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.7)).current;
  const avatarAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(headerAnim,  { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(avatarScale, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
        Animated.timing(avatarAnim,  { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim,    { toValue: 1.22, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulseAnim,    { toValue: 1,    duration: 1400, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0,   duration: 1400, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.4, duration: 1400, useNativeDriver: true }),
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
          text: "Se déconnecter", style: "destructive",
          onPress: async () => {
            try { await logout(); router.replace("/sign-in"); }
            catch { Alert.alert("Erreur", "Impossible de se déconnecter."); }
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
    } catch {
      Alert.alert(t("errors.somethingWentWrong"), "");
    } finally {
      setIsChangingLanguage(false);
    }
  };

  const getCurrentLang = () => LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  const openImagePicker = () => {
    Alert.alert("Photo de profil", "Choisir une option", [
      { text: "📷 Prendre une photo",  onPress: launchCamera        },
      { text: "🖼️ Depuis la galerie", onPress: launchImageLibrary   },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission refusée", "");
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1,1], quality: 0.8 });
    if (!result.canceled) { setSelectedImage(result.assets[0]); setShowPreview(true); }
  };

  const launchImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission refusée", "");
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1,1], quality: 0.8 });
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
        headers: { "Content-Type": "multipart/form-data" }, timeout: 30000,
      });
      if (response.data.imageUrl) {
        let url = response.data.imageUrl;
        if (!url.startsWith("http")) url = `http://192.168.43.125:5001${url.startsWith("/") ? "" : "/uploads/avatars/"}${url}`;
        const sep = url.includes("?") ? "&" : "?";
        setProfileImage(`${url}${sep}t=${Date.now()}`);
      }
      setShowPreview(false); setSelectedImage(null);
    } catch (e) {
      Alert.alert(t("errors.uploadFailed"), e.response?.data?.message || e.message);
    } finally { setIsUploading(false); }
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
    } finally { setIsSaving(false); }
  };

  const getImageSource = () => profileImage ? { uri: profileImage } : require("../../assets/images/avatar-user.png");
  const displayName = (user?.username || user?.name || "Apprenant").split(" ")[0];
  const initial = displayName[0]?.toUpperCase() || "M";

  const menuSections = [
    {
      title: "Compte",
      items: [
        {
          icon: "person-outline", iconBg: RED_LIGHT, iconColor: RED,
          label: t("profile.editProfile"),
          onPress: () => { setEditName(user?.name || ""); setEditEmail(user?.email || ""); setShowEditModal(true); },
        },
        {
          icon: "language-outline", iconBg: "#FFF3E0", iconColor: "#E65100",
          label: t("settings.language"),
          onPress: () => setShowLanguageModal(true),
          right: (
            <View style={p.langChip}>
              <Text style={p.langChipText}>{getCurrentLang().flag} {getCurrentLang().name}</Text>
            </View>
          ),
        },
      ],
    },
    {
      title: "Préférences",
      items: [
        { icon: "notifications-outline", iconBg: "#FFF8E1", iconColor: "#F9A825", label: t("settings.notifications"), onPress: () => {} },
        { icon: "shield-checkmark-outline", iconBg: "#E8F5E9", iconColor: "#2E7D32", label: "Confidentialité", onPress: () => {} },
        { icon: "settings-outline", iconBg: "#EDE7F6", iconColor: "#6A1B9A", label: t("settings.title"), onPress: () => {} },
        { icon: "help-circle-outline", iconBg: "#E3F2FD", iconColor: "#1565C0", label: t("settings.helpSupport"), onPress: () => {} },
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

      <ScrollView
        contentContainerStyle={p.scroll}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: BG }}
      >
        {/* ── Header bar ── */}
        <Animated.View style={[p.topBar, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-16,0] }) }],
        }]}>
          <TouchableOpacity onPress={() => router.back()} style={p.iconBtn}>
            <Ionicons name="arrow-back" size={20} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={p.pageTitle}>{t("profile.title")}</Text>
          <TouchableOpacity style={p.iconBtn} onPress={() => {}}>
            <Ionicons name="ellipsis-horizontal" size={20} color={TEXT_MID} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Avatar card ── */}
        <Animated.View style={[p.avatarCard, { opacity: avatarAnim, transform: [{ scale: avatarScale }] }]}>
          {/* Avatar */}
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
              <View style={p.cameraBtnInner}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Name + email + badge */}
          <Text style={p.userName}>{user?.username || user?.name || "Apprenant"}</Text>
          <Text style={p.userEmail}>{user?.email || ""}</Text>
          <View style={p.levelBadge}>
            <Text style={p.levelBadgeText}>🌍 Apprenant Mulema</Text>
          </View>

          {/* Divider */}
          <View style={p.divider} />

          {/* Quick actions */}
          <View style={p.quickActions}>
            <TouchableOpacity
              style={p.quickActionBtn}
              onPress={() => { setEditName(user?.name || ""); setEditEmail(user?.email || ""); setShowEditModal(true); }}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={16} color={RED} />
              <Text style={p.quickActionText}>Modifier</Text>
            </TouchableOpacity>
            <View style={p.quickActionSep} />
            <TouchableOpacity style={p.quickActionBtn} onPress={() => {}} activeOpacity={0.8}>
              <Ionicons name="share-outline" size={16} color={TEXT_MID} />
              <Text style={[p.quickActionText, { color: TEXT_MID }]}>Partager</Text>
            </TouchableOpacity>
            <View style={p.quickActionSep} />
            <TouchableOpacity style={p.quickActionBtn} onPress={() => {}} activeOpacity={0.8}>
              <Ionicons name="qr-code-outline" size={16} color={TEXT_MID} />
              <Text style={[p.quickActionText, { color: TEXT_MID }]}>QR Code</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Stats row ── */}
        <View style={p.statsRow}>
          <StatCard number={user?.totalPrawns || 0} label={t("profile.points")} icon="star"            color="#E8A000" delay={100} />
          <StatCard number={0}                       label={t("profile.completed")} icon="checkmark-circle" color={RED}      delay={180} />
          <StatCard number="–"                       label={t("profile.rank")}     icon="trophy"          color="#C62828"  delay={260} />
        </View>

        {/* ── Progress card ── */}
        <Animated.View style={[p.progressCard, { opacity: avatarAnim }]}>
          <View style={p.progressCardHeader}>
            <Text style={p.progressCardTitle}>Progression</Text>
            <View style={p.xpChip}>
              <Text style={p.xpChipText}>0 XP</Text>
            </View>
          </View>
          <Text style={p.progressCardSub}>Débutant · 0 / 100 XP pour le prochain niveau</Text>
          <View style={p.progressBarBg}>
            <View style={[p.progressBarFill, { width: "0%" }]} />
          </View>
          <View style={p.progressMilestones}>
            {["Débutant", "Intermédiaire", "Avancé", "Maître"].map((lvl, i) => (
              <View key={i} style={p.milestoneItem}>
                <View style={[p.milestoneDot, i === 0 && p.milestoneDotActive]} />
                <Text style={[p.milestoneLabel, i === 0 && p.milestoneLabelActive]}>{lvl}</Text>
              </View>
            ))}
          </View>
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
                  delay={280 + (si * 4 + ii) * 55}
                  isLast={ii === section.items.length - 1}
                />
              ))}
            </View>
          </View>
        ))}

        {/* ── App version ── */}
        <Text style={p.versionText}>Mulema v1.0.0 · Fait avec ❤️ au Cameroun</Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── IMAGE PREVIEW ── */}
      <BottomSheet visible={showPreview} onClose={() => { setShowPreview(false); setSelectedImage(null); }} title="Aperçu de la photo">
        {selectedImage && (
          <View style={{ alignItems: "center", paddingHorizontal: 24, paddingBottom: 28 }}>
            <View style={bs.previewImgWrap}>
              <Image source={{ uri: selectedImage.uri }} style={bs.previewImg} />
            </View>
            <Text style={bs.previewHint}>Cette photo sera visible sur ton profil.</Text>
            <View style={bs.previewBtns}>
              <TouchableOpacity
                onPress={() => { setShowPreview(false); setSelectedImage(null); }}
                style={bs.cancelBtn}
              >
                <Text style={bs.cancelBtnText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={uploadProfilePicture}
                disabled={isUploading}
                style={[bs.uploadBtn, isUploading && { opacity: 0.7 }]}
              >
                {isUploading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <>
                      <Ionicons name="cloud-upload-outline" size={17} color="#fff" />
                      <Text style={bs.uploadBtnText}>Définir comme photo</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* ── EDIT PROFILE ── */}
      <BottomSheet visible={showEditModal} onClose={() => setShowEditModal(false)} title={t("profile.editProfile")}>
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <Text style={bs.fieldLabel}>{t("profile.name")}</Text>
          <View style={[bs.fieldRow, editNameFocused && bs.fieldFocused]}>
            <Ionicons name="person-outline" size={16} color={editNameFocused ? RED : TEXT_LIGHT} style={{ marginRight: 10 }} />
            <TextInput
              style={bs.fieldInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Ton nom"
              placeholderTextColor={TEXT_LIGHT}
              onFocus={() => setEditNameFocused(true)}
              onBlur={() => setEditNameFocused(false)}
            />
          </View>

          <Text style={[bs.fieldLabel, { marginTop: 16 }]}>{t("profile.email")}</Text>
          <View style={[bs.fieldRow, editEmailFocused && bs.fieldFocused]}>
            <Ionicons name="mail-outline" size={16} color={editEmailFocused ? RED : TEXT_LIGHT} style={{ marginRight: 10 }} />
            <TextInput
              style={bs.fieldInput}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="ton@email.com"
              placeholderTextColor={TEXT_LIGHT}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEditEmailFocused(true)}
              onBlur={() => setEditEmailFocused(false)}
            />
          </View>

          <TouchableOpacity
            onPress={saveProfile}
            disabled={isSaving}
            style={[bs.saveBtn, isSaving && { opacity: 0.7 }]}
            activeOpacity={0.85}
          >
            {isSaving
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={bs.saveBtnText}>{t("common.save")}</Text>
                </>
            }
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* ── LANGUAGE MODAL ── */}
      <BottomSheet visible={showLanguageModal} onClose={() => setShowLanguageModal(false)} title={t("settings.selectLanguage")}>
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          {LANGUAGES.map((lang) => {
            const selected = currentLanguage === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => handleLanguageChange(lang.code)}
                disabled={isChangingLanguage}
                activeOpacity={0.8}
              >
                <View style={[bs.langOption, selected && bs.langOptionSelected]}>
                  <Text style={bs.langFlag}>{lang.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[bs.langName, selected && { color: RED }]}>{lang.name}</Text>
                    <Text style={bs.langSub}>{lang.sub}</Text>
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={22} color={RED} />}
                </View>
              </TouchableOpacity>
            );
          })}
          {isChangingLanguage && <ActivityIndicator color={RED} style={{ marginTop: 12 }} />}
        </View>
      </BottomSheet>
    </View>
  );
};

// ── Profile styles ─────────────────────────────────────────────────────────
const p = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingTop: Platform.OS === "ios" ? 54 : 40, paddingBottom: 20 },

  // Top bar
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, marginBottom: 20,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
    ...CARD_SHADOW,
  },
  pageTitle: {
    fontSize: 17, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold", letterSpacing: 0.3,
  },

  // Avatar card — white card style
  avatarCard: {
    backgroundColor: CARD_BG, borderRadius: 24,
    marginHorizontal: 16, marginBottom: 16,
    paddingTop: 28, paddingBottom: 0,
    alignItems: "center",
    ...CARD_SHADOW,
  },
  avatarWrap: { position: "relative", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  pulseRing: {
    position: "absolute", width: 108, height: 108, borderRadius: 54,
    borderWidth: 2, borderColor: RED,
  },
  avatarOuter: {
    width: 92, height: 92, borderRadius: 46, overflow: "hidden",
    borderWidth: 3, borderColor: "#fff",
    shadowColor: RED, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  avatarImg:      { width: "100%", height: "100%", borderRadius: 46 },
  avatarFallback: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  avatarInitial:  { fontSize: 34, fontWeight: "800", color: "#fff", fontFamily: "Nunito-ExtraBold" },
  cameraBtn: {
    position: "absolute", bottom: 0, right: 0,
    borderWidth: 2.5, borderColor: BG, borderRadius: 16,
  },
  cameraBtnInner: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: RED,
    alignItems: "center", justifyContent: "center",
  },

  userName:  {
    fontSize: 22, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold", letterSpacing: 0.2, marginBottom: 4,
  },
  userEmail: { fontSize: 13, color: TEXT_LIGHT, fontFamily: "Nunito-Regular", marginBottom: 10 },
  levelBadge: {
    backgroundColor: RED_LIGHT,
    borderRadius: 20, borderWidth: 1, borderColor: `${RED}25`,
    paddingHorizontal: 14, paddingVertical: 5, marginBottom: 18,
  },
  levelBadgeText: { color: RED, fontSize: 12, fontWeight: "700", fontFamily: "Nunito-Bold" },

  divider: { width: "100%", height: 1, backgroundColor: "#F0EDE6" },

  // Quick actions row inside avatar card
  quickActions: {
    flexDirection: "row", width: "100%",
    paddingVertical: 4,
  },
  quickActionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 14,
  },
  quickActionText: {
    fontSize: 13, fontWeight: "700", color: RED,
    fontFamily: "Nunito-Bold",
  },
  quickActionSep: { width: 1, backgroundColor: "#F0EDE6", marginVertical: 10 },

  // Stats row
  statsRow: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 16, marginBottom: 14,
  },
  statCard: {
    flex: 1, backgroundColor: CARD_BG, borderRadius: 18,
    padding: 14, alignItems: "center", gap: 6,
    ...CARD_SHADOW,
  },
  statIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
    marginBottom: 2,
  },
  statNum:   { fontSize: 20, fontWeight: "900", fontFamily: "Nunito-ExtraBold" },
  statLabel: { fontSize: 10, color: TEXT_LIGHT, fontWeight: "600", textAlign: "center", fontFamily: "Nunito-SemiBold" },

  // Progress card
  progressCard: {
    backgroundColor: CARD_BG, borderRadius: 20,
    marginHorizontal: 16, marginBottom: 14, padding: 18,
    ...CARD_SHADOW,
  },
  progressCardHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 4,
  },
  progressCardTitle: { fontSize: 15, fontWeight: "800", color: TEXT_DARK, fontFamily: "Nunito-ExtraBold" },
  xpChip: {
    backgroundColor: RED_LIGHT, borderRadius: 12, borderWidth: 1, borderColor: `${RED}25`,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  xpChipText: { fontSize: 12, color: RED, fontWeight: "700", fontFamily: "Nunito-Bold" },
  progressCardSub: { fontSize: 12, color: TEXT_LIGHT, fontFamily: "Nunito-Regular", marginBottom: 12 },
  progressBarBg:   { height: 8, backgroundColor: "#EEE", borderRadius: 4, overflow: "hidden", marginBottom: 14 },
  progressBarFill: { height: "100%", backgroundColor: RED, borderRadius: 4 },

  progressMilestones: { flexDirection: "row", justifyContent: "space-between" },
  milestoneItem: { alignItems: "center", gap: 4 },
  milestoneDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#DDD" },
  milestoneDotActive: { backgroundColor: RED, shadowColor: RED, shadowOpacity: 0.4, shadowRadius: 4 },
  milestoneLabel: { fontSize: 10, color: TEXT_LIGHT, fontFamily: "Nunito-SemiBold" },
  milestoneLabelActive: { color: RED, fontWeight: "700", fontFamily: "Nunito-Bold" },

  // Menu sections
  section: { paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: {
    fontSize: 11, fontWeight: "700", color: TEXT_LIGHT,
    fontFamily: "Nunito-Bold",
    letterSpacing: 1.2, textTransform: "uppercase",
    marginBottom: 8, paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: CARD_BG, borderRadius: 18,
    overflow: "hidden",
    ...CARD_SHADOW,
  },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1, borderBottomColor: "#F5F3F0",
  },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  menuLabel: {
    fontSize: 14, fontWeight: "500", color: TEXT_DARK,
    fontFamily: "Nunito-SemiBold",
  },

  langChip: {
    backgroundColor: "#FFF3E0", borderRadius: 10,
    paddingHorizontal: 9, paddingVertical: 4,
    borderWidth: 1, borderColor: "#FFE0B2",
  },
  langChipText: { color: "#E65100", fontSize: 12, fontWeight: "600", fontFamily: "Nunito-Bold" },

  versionText: {
    textAlign: "center", fontSize: 11,
    color: TEXT_LIGHT, fontFamily: "Nunito-Regular",
    marginTop: 8,
  },
});

// ── Bottom sheet styles ────────────────────────────────────────────────────
const bs = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.38)", justifyContent: "flex-end" },
  sheet:      { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  sheetInner: { backgroundColor: CARD_BG, paddingTop: 12 },
  handle: {
    width: 44, height: 5, borderRadius: 3,
    backgroundColor: "#DDD", alignSelf: "center", marginBottom: 18,
  },
  titleRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24, marginBottom: 18,
  },
  title:    { fontSize: 19, fontWeight: "800", color: TEXT_DARK, fontFamily: "Nunito-ExtraBold" },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#F5F3F0",
    borderWidth: 1, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
  },

  // Preview
  previewImgWrap: {
    width: 170, height: 170, borderRadius: 85,
    overflow: "hidden",
    borderWidth: 3, borderColor: `${RED}40`,
    marginBottom: 14,
    ...CARD_SHADOW,
  },
  previewImg:  { width: "100%", height: "100%" },
  previewHint: { color: TEXT_MID, fontSize: 13, fontFamily: "Nunito-Regular", marginBottom: 22, textAlign: "center" },
  previewBtns: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: "#F5F3F0",
    borderWidth: 1, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
  },
  cancelBtnText: { color: TEXT_MID, fontWeight: "600", fontSize: 14, fontFamily: "Nunito-SemiBold" },
  uploadBtn: {
    flex: 1.4, paddingVertical: 14, borderRadius: 14,
    backgroundColor: RED,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
  },
  uploadBtnText: { color: "#fff", fontWeight: "700", fontSize: 14, fontFamily: "Nunito-Bold" },

  // Fields
  fieldLabel: {
    color: TEXT_MID, fontSize: 11, fontWeight: "700",
    fontFamily: "Nunito-Bold",
    letterSpacing: 1, textTransform: "uppercase", marginBottom: 8,
  },
  fieldRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F7F5F2",
    borderRadius: 14, borderWidth: 1.5, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  fieldFocused: { borderColor: RED, backgroundColor: RED_LIGHT },
  fieldInput:   { flex: 1, color: TEXT_DARK, fontSize: 15, fontFamily: "Nunito-Regular" },
  saveBtn: {
    marginTop: 22, backgroundColor: RED,
    borderRadius: 16, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Nunito-Bold" },

  // Language
  langOption: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#F7F5F2",
    borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    padding: 14, marginBottom: 10,
  },
  langOptionSelected: { borderColor: `${RED}40`, backgroundColor: RED_LIGHT },
  langFlag: { fontSize: 30 },
  langName: { fontSize: 15, fontWeight: "700", color: TEXT_DARK, fontFamily: "Nunito-Bold" },
  langSub:  { fontSize: 12, color: TEXT_LIGHT, marginTop: 2, fontFamily: "Nunito-Regular" },
});

export default Profile;