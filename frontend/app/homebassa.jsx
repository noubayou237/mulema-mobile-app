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
import * as Haptics from "expo-haptics";

const smallPyramid = require("../assets/images/pyramid-small.png");
const largePyramid = require("../assets/images/pyramid-large.png");
const sphinx = require("../assets/images/sphinx.png");
const camel = require("../assets/images/camel.png");
const lockIcon = require("../assets/images/lock.png");

const { width } = Dimensions.get("window");

const LEVELS_DATA = [
  { id: 1, title: "NIVEAU I", unlocked: true, path: "/exercices/exos1" },
  { id: 2, title: "NIVEAU II", unlocked: false, path: "/levels/bassa/level2" },
  { id: 3, title: "NIVEAU III", unlocked: false, path: "/levels/bassa/level3" },
  { id: 4, title: "NIVEAU IV", unlocked: false, path: "/levels/bassa/level4" }
];

export default function HomeBassa() {
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
            bg-card rounded-3xl py-6 shadow-md
            ${!level.unlocked ? "opacity-40" : ""}
            ${!isFirst ? "-mt-12" : ""}
          `}
        >
          {/* HEADER NIVEAU 1 */}
          {isFirst && (
            <View className="items-center mb-4 z-10 px-6">
              <Text className="text-2xl font-bold text-primary mb-2">
                {level.title}
              </Text>
              <Text className="text-sm text-muted-foreground text-center">
                Débloquez les niveaux suivants en résolvant les exercices
                précédents
              </Text>
            </View>
          )}

          {/* MAP ELEMENT */}
          <View className="relative w-[90%] h-[120px] items-center justify-center mb-2">

            <Image
              source={smallPyramid}
              className="absolute w-20 h-20 left-5 top-3"
              resizeMode="contain"
            />

            <Image
              source={largePyramid}
              className="absolute w-32 h-32 right-3 bottom-0"
              resizeMode="contain"
            />

            {isFirst && (
              <>
                <Image
                  source={sphinx}
                  style={{
                    width: 100,
                    height: 60,
                    position: "absolute",
                    left: width * 0.15,
                    bottom: 0,
                  }}
                  resizeMode="contain"
                />
                <Image
                  source={camel}
                  style={{
                    width: 80,
                    height: 50,
                    position: "absolute",
                    right: width * 0.1,
                    top: 20,
                  }}
                  resizeMode="contain"
                />
              </>
            )}

            {!level.unlocked && (
              <Image
                source={lockIcon}
                className="absolute w-10 h-10 z-20"
                resizeMode="contain"
              />
            )}
          </View>

          {/* LEVEL INDICATOR */}
          <View className="bg-primary px-6 py-2 rounded-full mt-3">
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
      {/* MAP PATH */}
      <View className="absolute top-0 bottom-0 w-full bg-secondary/30" />

      <View className="w-full items-center relative">
        {LEVELS_DATA.map(renderLevelCard)}
      </View>

      <View className="h-24" />
    </ScrollView>
  );
}