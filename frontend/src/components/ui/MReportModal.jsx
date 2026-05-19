/**
 * MULEMA — Reporting Modal (UGC Compliance)
 * Allows users to report inappropriate names or behaviors on the leaderboard.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors, Typo, Space, Radius, Shadow } from "../../theme/tokens";
import api from "../../services/api";

export const MReportModal = ({ visible, onClose, reportedUser }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const reasons = [
    { id: "inappropriate_name", label: t("report.inappropriateName", "Nom inapproprié") },
    { id: "spam", label: t("report.spam", "Spam / Robot") },
    { id: "harassment", label: t("report.harassment", "Harcèlement") },
    { id: "other", label: t("report.other", "Autre") },
  ];

  const handleReport = async () => {
    if (!reason) {
      Alert.alert(t("common.error"), t("report.selectReason", "Veuillez sélectionner un motif."));
      return;
    }

    setLoading(true);
    try {
      await api.post("/user/report", {
        reportedId: reportedUser.id,
        reason: reason,
        description: description,
      });
      Alert.alert(
        t("report.successTitle", "Signalement envoyé"),
        t("report.successMsg", "Merci. Nous examinerons ce signalement sous 24 heures et prendrons les mesures nécessaires.")
      );
      onClose();
      // Reset state
      setReason("");
      setDescription("");
    } catch (error) {
      console.error("Report error:", error);
      Alert.alert(t("common.error"), t("report.errorMsg", "Une erreur est survenue lors de l'envoi du signalement."));
    } finally {
      setLoading(true);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={s.keyboardView}
        >
          <View style={[s.content, Shadow.lg]}>
            {/* Header */}
            <View style={s.header}>
              <Text style={Typo.titleLg}>{t("report.title", "Signaler un contenu")}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={24} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <Text style={[Typo.bodyMd, { color: Colors.textSecondary, marginBottom: Space.xl }]}>
              {t("report.reportingUser", "Vous signalez")}: <Text style={{ fontWeight: "700", color: Colors.onSurface }}>{reportedUser?.username || reportedUser?.name}</Text>
            </Text>

            {/* Reasons */}
            <Text style={[Typo.labelSm, { color: Colors.primary, marginBottom: Space.md }]}>
              {t("report.reasonLabel", "POURQUOI SIGNALEZ-VOUS CE COMPTE ?")}
            </Text>
            <View style={s.reasonsGrid}>
              {reasons.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[s.reasonBtn, reason === r.id && s.reasonBtnActive]}
                  onPress={() => setReason(r.id)}
                >
                  <Text style={[s.reasonTxt, reason === r.id && s.reasonTxtActive]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <Text style={[Typo.labelSm, { color: Colors.primary, marginTop: Space.xl, marginBottom: Space.md }]}>
              {t("report.descriptionLabel", "PLUS DE DÉTAILS (OPTIONNEL)")}
            </Text>
            <TextInput
              style={s.input}
              placeholder={t("report.detailsPlaceholder", "Dites-nous en plus...")}
              placeholderTextColor={Colors.textTertiary}
              multiline={true}
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            {/* Disclaimer */}
            <View style={s.disclaimer}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.textTertiary} />
              <Text style={[Typo.bodySm, { color: Colors.textTertiary, marginLeft: Space.sm, flex: 1 }]}>
                {t("report.disclaimer", "Les signalements sont confidentiels. Nos modérateurs agiront rapidement si une violation est constatée.")}
              </Text>
            </View>

            {/* Action */}
            <TouchableOpacity
              style={[s.submitBtn, (!reason || loading) && { opacity: 0.5 }]}
              onPress={handleReport}
              disabled={!reason || loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.onPrimary} />
              ) : (
                <Text style={[Typo.titleMd, { color: Colors.onPrimary }]}>{t("report.submit", "Envoyer le signalement")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 10, 15, 0.7)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    width: "100%",
  },
  content: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius["3xl"],
    borderTopRightRadius: Radius["3xl"],
    padding: Space["2xl"],
    paddingBottom: Platform.OS === "ios" ? 40 : Space["2xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Space.lg,
  },
  reasonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Space.sm,
  },
  reasonBtn: {
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.transparent,
  },
  reasonBtnActive: {
    backgroundColor: Colors.primary + "15",
    borderColor: Colors.primary,
  },
  reasonTxt: {
    ...Typo.bodySm,
    color: Colors.textSecondary,
  },
  reasonTxtActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  input: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: Space.lg,
    color: Colors.onSurface,
    ...Typo.bodyMd,
    height: 100,
    textAlignVertical: "top",
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Space.xl,
    padding: Space.lg,
    backgroundColor: Colors.surfaceVariant + "30",
    borderRadius: Radius.md,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: Space["2xl"],
    ...Shadow.primaryGlow,
  },
});
