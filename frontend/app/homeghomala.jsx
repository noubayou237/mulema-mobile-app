import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

const mountainLarge = require("../assets/images/mountain-large.png");
const mountainSmall = require("../assets/images/mountain-small.png");
const lockIcon = require("../assets/images/lock.png");

const LEVELS_DATA = [
  { id: 1, title: "NIVEAU I", unlocked: true, path: "/exercices/exos1" },
  { id: 2, title: "NIVEAU II", unlocked: false, path: "/levels/ghomala/level2" },
  { id: 3, title: "NIVEAU III", unlocked: false, path: "/levels/ghomala/level3" },
  { id: 4, title: "NIVEAU IV", unlocked: false, path: "/levels/ghomala/level4" }
];

export default function HomeGhomalah() {
  const router = useRouter();

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

    return (
      <View key={level.id} className="w-full min-h-[250px] items-center">
        <TouchableOpacity
          onPress={() => handleStartLevel(level)}
          disabled={!level.unlocked}
          activeOpacity={0.85}
          className={`
            w-full min-h-[250px] items-center relative 
            bg-card rounded-t-[100px] rounded-br-[100px] py-6 shadow-md
            ${!level.unlocked ? "opacity-40" : ""}
            ${!isFirst ? "-mt-12" : ""}
          `}
        >
          {/* HEADER NIVEAU 1 */}
          {isFirst && (
            <View className="w-full items-center mb-4 z-10 px-6">
              <Text className="text-2xl font-bold text-primary mb-2">
                {level.title}
              </Text>
              <Text className="text-sm text-muted-foreground text-center">
                Débloquez les niveaux suivants en résolvant les exercices
                précédents
              </Text>
            </View>
          )}

          {/* MONTAGNE */}
          <View className="relative w-[90%] h-[120px] items-center justify-center mb-2">
            <Image
              source={isFirst ? mountainLarge : mountainSmall}
              className={`
                absolute 
                ${isFirst ? "w-[250px] h-[150px] -top-12" : "w-[180px] h-[100px] -top-8"}
              `}
              resizeMode="contain"
            />

            {!level.unlocked && (
              <Image
                source={lockIcon}
                className="absolute w-10 h-10 z-20"
                resizeMode="contain"
              />
            )}
          </View>

          {/* INDICATEUR */}
          <View className="bg-primary px-6 py-2 rounded-full mt-4">
            <Text className="text-white font-bold text-base">
              {isFirst ? "START" : `Niveau ${level.id}`}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: 20,
        paddingHorizontal: 20,
        alignItems: "center"
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full items-center relative bg-secondary/40 rounded-3xl">

        {/* FOREST BACKGROUND */}
        <View className="absolute top-0 bottom-0 w-full bg-secondary opacity-50 rounded-3xl" />

        {LEVELS_DATA.map(renderLevelCard)}
      </View>

      <View className="h-24" />
    </ScrollView>
  );
}