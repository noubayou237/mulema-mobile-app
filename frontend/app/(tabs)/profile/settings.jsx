/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Settings Screen                                     ║
 * ║  Matches Settings.png maquette                                ║
 * ║  Place at: app/(tabs)/profile/settings.jsx                    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Switch, Alert,
  StyleSheet, Platform, StatusBar, Modal, TextInput, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
// LinearGradient removed — premium banner removed per directive
import * as WebBrowser from "expo-web-browser";

import { Colors, Typo, Space, Radius, Shadow } from "../../../src/theme/tokens";
import { useAuthStore } from "../../../src/stores/useAuthStore";
import api from "../../../src/services/api";

import { useTranslation } from "react-i18next";
import { changeLanguage } from "../../../src/i18n";

/* ── Reusable Setting Row ── */
const SettingRow = ({ icon, iconColor, label, subtitle, right, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    style={s.settingRow}
  >
    <View style={[s.settingIcon, { backgroundColor: (iconColor || Colors.primary) + "15" }]}>
      <Ionicons name={icon} size={20} color={iconColor || Colors.primary} />
    </View>
    <View style={{ flex: 1, marginLeft: Space.lg }}>
      <Text style={Typo.titleSm}>{label}</Text>
      {subtitle && <Text style={[Typo.bodySm, { marginTop: 2 }]}>{subtitle}</Text>}
    </View>
    {right || (onPress && <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />)}
  </TouchableOpacity>
);

/* ── Section Header ── */
const SectionHeader = ({ title }) => (
  <Text style={[Typo.labelSm, { color: Colors.primary, marginTop: Space["2xl"], marginBottom: Space.md, marginLeft: Space.xs }]}>
    {title}
  </Text>
);

/* ══════════════════════════════════════════════════════════════ */

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [notificationsOn, setNotificationsOn] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const { t, i18n } = useTranslation();
  const [appLang, setAppLang] = useState(i18n.language || 'fr');

  const handleToggleLang = async () => {
    const nextLang = appLang.startsWith('fr') ? 'en' : 'fr';
    await changeLanguage(nextLang);
    setAppLang(nextLang);
  };

  const handleLogout = () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.confirm"), style: "destructive", onPress: () => logout() },
    ]);
  };

  const handleOpenPrivacyPolicy = async () => {
    const url = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL;
    if (url) {
      await WebBrowser.openBrowserAsync(url);
    } else {
      Alert.alert(t("common.error"), t("errors.privacyUrlNotSet"));
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      Alert.alert("Erreur", 'Veuillez saisir "DELETE" pour confirmer.');
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete("/user");
      setShowDeleteModal(false);
      Alert.alert(t("common.success"), t("messages.accountDeleted"), [
        { text: t("common.ok"), onPress: () => logout() }
      ]);
    } catch (error) {
      console.error("Delete account error:", error);
      Alert.alert(t("common.error"), t("errors.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* ── Sticky Header ── */}
      <View style={s.stickyHeader}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={[Typo.titleLg, { marginLeft: Space.md }]}>{t("settings.title", "Paramètres")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: 90 }]} showsVerticalScrollIndicator={false}>

        {/* Premium Banner removed per directive */}

        {/* ── COMPTE ── */}
        <SectionHeader title={t("auth.account", "COMPTE").toUpperCase()} />
        <View style={[s.sectionCard, Shadow.sm]}>
          <SettingRow
            icon="person-circle"
            label={t("profile.editProfile")}
            subtitle={t("profile.editSubtitle")}
            onPress={() => router.push("/(tabs)/profile/edit")}
          />
          <View style={s.divider} />
          <SettingRow
            icon="mail"
            label={t("auth.email", "Email")}
            subtitle={user?.email || "mulema.learner@example.com"}
            onPress={() => Alert.alert(t("auth.email"), t("settings.emailChangeHint", "Contact support to change your email address."))}
          />
          <View style={s.divider} />
          <SettingRow
            icon="lock-closed"
            label={t("auth.password", "Password")}
            subtitle="••••••••••"
            onPress={() => Alert.alert(t("auth.password"), t("settings.passwordChangeHint", "Use 'Forgot Password' on the login screen to reset your password."))}
          />
        </View>

        {/* ── APPRENTISSAGE ── */}
        <SectionHeader title={t("nav.lessons", "APPRENTISSAGE").toUpperCase()} />
        <View style={[s.sectionCard, Shadow.sm]}>
          <SettingRow
            icon="notifications"
            iconColor={Colors.primary}
            label={t("settings.notifications", "Notifications")}
            right={
              <Switch
                value={notificationsOn}
                onValueChange={setNotificationsOn}
                trackColor={{ false: Colors.surfaceVariant, true: Colors.primary + "60" }}
                thumbColor={notificationsOn ? Colors.primary : Colors.surfaceContainerHigh}
              />
            }
          />
          <View style={s.divider} />
          <SettingRow
            icon="alarm"
            label={t("settings.dailyReminders")}
            right={
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[Typo.bodyMd, { color: Colors.textSecondary }]}>20:00</Text>
                <Ionicons name="pencil" size={14} color={Colors.textTertiary} style={{ marginLeft: Space.sm }} />
              </View>
            }
            onPress={() => {}}
          />
        </View>

        {/* ── PRÉFÉRENCES ── */}
        <SectionHeader title={t("settings.preferences")} />
        <View style={[s.sectionCard, Shadow.sm]}>
          <SettingRow
            icon="moon"
            label={t("settings.darkMode", "Mode sombre")}
            right={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.surfaceVariant, true: Colors.primary + "60" }}
                thumbColor={darkMode ? Colors.primary : Colors.surfaceContainerHigh}
              />
            }
          />
          <View style={s.divider} />
          <SettingRow
            icon="globe"
            label={t("settings.interfaceLanguage")}
            right={
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[Typo.bodyMd, { color: Colors.textSecondary, fontWeight: "bold" }]}>
                  {appLang.startsWith('fr') ? 'Français' : 'English'}
                </Text>
                <Ionicons name="swap-horizontal" size={16} color={Colors.primary} style={{ marginLeft: Space.sm }} />
              </View>
            }
            onPress={handleToggleLang}
          />
        </View>

        {/* ── SUPPORT & LEGAL ── */}
        <SectionHeader title={t("settings.supportLegal")} />
        <View style={[s.sectionCard, Shadow.sm]}>
          <SettingRow
            icon="help-circle"
            iconColor={Colors.primary}
            label={t("settings.helpSupport", "Aide")}
            right={<Ionicons name="open-outline" size={16} color={Colors.textTertiary} />}
            onPress={() => {}}
          />
          <View style={s.divider} />
          <SettingRow
            icon="document-text"
            label={t("settings.terms", "Conditions d'utilisation")}
            onPress={() => {}}
          />
          <View style={s.divider} />
          <SettingRow
            icon="shield-checkmark-outline"
            label={t("settings.privacy", "Politique de confidentialité")}
            onPress={handleOpenPrivacyPolicy}
          />
          <View style={s.divider} />
          {/* Déconnexion */}
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} style={s.settingRow}>
            <View style={[s.settingIcon, { backgroundColor: Colors.error + "15" }]}>
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            </View>
            <Text style={[Typo.titleSm, { color: Colors.error, marginLeft: Space.lg }]}>{t("profile.logout", "Déconnexion")}</Text>
          </TouchableOpacity>
          <View style={s.divider} />
          {/* Supprimer le compte */}
          <TouchableOpacity onPress={() => setShowDeleteModal(true)} activeOpacity={0.7} style={s.settingRow}>
            <View style={[s.settingIcon, { backgroundColor: Colors.error + "10" }]}>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </View>
            <Text style={[Typo.titleSm, { color: Colors.error, marginLeft: Space.lg }]}>{t("common.delete", "Supprimer le compte")}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={[Typo.labelSm, { color: Colors.textTertiary }]}>MULEMA APP V2.4.1 (622)</Text>
          <Text style={[Typo.bodySm, { color: Colors.textTertiary, marginTop: Space.xs }]}>{t("settings.madeWithLove")}</Text>
        </View>

        <View style={{ height: Space["4xl"] }} />
      </ScrollView>

      {/* ── DELETE ACCOUNT MODAL ── */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !isDeleting && setShowDeleteModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={[Typo.titleMd, { color: Colors.error, textAlign: "center" }]}>{t("settings.deleteAccountTitle")}</Text>
            <Text style={[Typo.bodyMd, { textAlign: "center", marginTop: Space.md, color: Colors.textSecondary }]}>
              {t("settings.deleteAccountDesc")}
            </Text>
            <Text style={[Typo.labelLg, { textAlign: "center", marginTop: Space.lg, color: Colors.onSurface }]}>
              {t("settings.typeDeleteToConfirm")} <Text style={{ fontWeight: "700", color: Colors.error }}>DELETE</Text>
            </Text>
            
            <TextInput
              style={s.deleteInput}
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              placeholder="DELETE"
              autoCapitalize="characters"
              editable={!isDeleting}
            />

            <View style={s.modalButtons}>
              <TouchableOpacity 
                onPress={() => { setShowDeleteModal(false); setDeleteConfirmation(""); }} 
                disabled={isDeleting}
                style={[s.modalBtn, { backgroundColor: Colors.surfaceVariant }]}
              >
                <Text style={[Typo.labelLg, { color: Colors.onSurfaceVariant }]}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== "DELETE"}
                style={[s.modalBtn, { backgroundColor: Colors.error, opacity: (deleteConfirmation === "DELETE" && !isDeleting) ? 1 : 0.5 }]}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={[Typo.labelLg, { color: "#FFF" }]}>{t("common.delete")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Space["2xl"], paddingBottom: Space["2xl"] },

  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 44, paddingBottom: Space.xl,
    paddingHorizontal: Space["2xl"],
  },

  // Premium banner styles removed

  // Section card (no-border rule — background shift)
  sectionCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    overflow: "hidden",
  },

  // Setting row
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Space.lg,
    paddingHorizontal: Space.xl,
  },
  settingIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },

  // Divider (subtle — ghost border)
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceVariant + "60",
    marginLeft: 40 + Space.xl + Space.lg, // aligned with text
  },

  // Footer
  footer: {
    alignItems: "center",
    marginTop: Space["3xl"],
  },

  // Modal Styles
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
    padding: Space["2xl"],
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Space["2xl"],
    width: "100%",
    maxWidth: 400,
    ...Shadow.md,
  },
  deleteInput: {
    borderWidth: 1,
    borderColor: Colors.error + "40",
    borderRadius: Radius.md,
    padding: Space.lg,
    fontSize: 16,
    textAlign: "center",
    marginTop: Space.lg,
    color: Colors.error,
    fontWeight: "700",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Space["2xl"],
    gap: Space.md,
  },
  modalBtn: {
    flex: 1, height: 48,
    borderRadius: Radius.full,
    alignItems: "center", justifyContent: "center",
  },
});