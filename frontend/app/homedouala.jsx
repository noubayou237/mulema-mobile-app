import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

const boatImage = require("../assets/images/boat.png");
const islandImage = require("../assets/images/island.png");
const lockIcon = require("../assets/images/lock.png");

const { width } = Dimensions.get("window");

export default function HomeDouala() {
  const router = useRouter();
  const { t } = useTranslation();

  const LEVELS_DATA = [
    { id: 1, title: t("home.levelI"), unlocked: true, path: "/exercices/exos1" },
    { id: 2, title: t("home.levelII"), unlocked: false, path: "/levels/douala/level2" },
    { id: 3, title: t("home.levelIII"), unlocked: false, path: "/levels/douala/level3" },
    { id: 4, title: t("home.levelIV"), unlocked: false, path: "/levels/douala/level4" }
  ];

  const triggerFeedback = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  };

  const handleStartLevel = async (level) => {
    await triggerFeedback();
    if (level.unlocked) {
      router.push(level.path);
    }
  };

  const renderLevelCard = (level, index) => {
    const isFirst = index === 0;
    const alignRight = level.id % 2 === 0;

    return (
      <View
        key={level.id}
        className={`w-full min-h-[250px] px-5 ${alignRight ? "items-end" : "items-start"}`}
      >
        <TouchableOpacity
          onPress={() => handleStartLevel(level)}
          disabled={!level.unlocked}
          activeOpacity={0.85}
          className={`w-[150px] h-[150px] items-center justify-center relative mt-6 
            ${!level.unlocked ? "opacity-40" : ""}`}
        >
          {/* HEADER NIVEAU 1 */}
          {isFirst && (
            <View
              style={{
                width: width,
                position: "absolute",
                top: -100,
                left: 0,
                alignItems: "center",
              }}
            >
              <Text className="text-2xl font-bold text-primary mb-2">
                {level.title}
              </Text>
              <Text className="text-sm text-muted-foreground text-center px-8">
                {t("home.unlockMessage")}
              </Text>
            </View>
          )}

          {/* ÎLE */}
          <Image
            source={islandImage}
            className="absolute w-[120px] h-[120px]"
            resizeMode="contain"
          />

          {/* BATEAU */}
          <Image
            source={boatImage}
            style={{
              width: 80,
              height: 40,
              position: "absolute",
              top: 50,
              left: alignRight ? 10 : undefined,
              right: !alignRight ? 10 : undefined,
            }}
            resizeMode="contain"
          />

          {/* LOCK */}
          {!level.unlocked && (
            <Image
              source={lockIcon}
              className="absolute w-10 h-10 z-20"
              resizeMode="contain"
            />
          )}

          {/* INDICATEUR */}
          <View className="bg-primary px-4 py-2 rounded-full absolute bottom-0">
            <Text className="text-white font-bold text-sm">
              {isFirst
                ? t("home.start")
                : `${t("home.niveau")} ${level.id}`}
            </Text>
          </View>
        </TouchableOpacity>

        {/* GAP RIVIÈRE */}
        <View className="h-24" />
      </View>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: 20,
        alignItems: "center"
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full items-center relative px-5">

        {/* RIVIÈRE CENTRALE */}
        <View
          className="absolute top-0 bottom-0 bg-secondary rounded-full"
          style={{
            width: 60,
            left: "50%",
            transform: [{ translateX: -30 }]
          }}
        />

        {LEVELS_DATA.map(renderLevelCard)}
      </View>

      <View className="h-24" />
    </ScrollView>
  );
}