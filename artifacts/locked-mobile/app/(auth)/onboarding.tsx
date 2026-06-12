import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";

const SPORTS = [
  "Lacrosse",
  "Basketball",
  "Soccer",
  "Football",
  "Baseball",
  "Softball",
  "Swimming",
  "Track & Field",
  "Volleyball",
  "Wrestling",
  "Tennis",
  "Field Hockey",
  "Rowing",
  "Cross Country",
];

const LEVELS = [
  "Middle School",
  "High School JV",
  "High School Varsity",
  "Club / Travel",
  "College",
];

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { setProfile } = useProfile();

  const [handle, setHandle] = useState("");
  const [sport, setSport] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !!handle.trim() && !!sport && !!level && !loading;

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setLoading(true);
    setError(null);
    const trimmed = handle.trim();
    const { error: err } = await supabase
      .from("profiles")
      .upsert({ id: user.id, handle: trimmed, sport, level });
    setLoading(false);
    if (err) {
      setError("Failed to save profile. Try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setProfile({ id: user.id, handle: trimmed, sport, level });
    }
  };

  const s = styles(colors);

  return (
    <ScrollView
      style={[s.container, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}
      contentContainerStyle={s.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.logo}>
        <Text style={s.logoWhite}>Locke</Text>
        <Text style={s.logoGreen}>d</Text>
      </Text>
      <Text style={s.title}>
        Set up your{"\n"}
        <Text style={s.titleAccent}>profile.</Text>
      </Text>
      <Text style={s.subtitle}>Tell us who you are so we can match your community.</Text>

      <View style={s.card}>
        <View style={s.field}>
          <Text style={s.label}>Your handle</Text>
          <TextInput
            style={s.input}
            value={handle}
            onChangeText={setHandle}
            placeholder="e.g. Jordan23, CoachMike..."
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            testID="input-display-name"
          />
        </View>

        <View style={s.field}>
          <Text style={s.label}>Your sport</Text>
          <View style={s.grid}>
            {SPORTS.map((s2) => (
              <TouchableOpacity
                key={s2}
                style={[s.chip, sport === s2 && s.chipActive]}
                onPress={() => {
                  setSport(s2);
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.75}
                testID={`button-sport-${s2}`}
              >
                <Text style={[s.chipText, sport === s2 && s.chipTextActive]}>
                  {s2}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.field}>
          <Text style={s.label}>Your level</Text>
          <View style={s.levelList}>
            {LEVELS.map((l) => (
              <TouchableOpacity
                key={l}
                style={[s.levelRow, level === l && s.levelRowActive]}
                onPress={() => {
                  setLevel(l);
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.75}
                testID={`button-level-${l}`}
              >
                <Text style={[s.levelText, level === l && s.levelTextActive]}>
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error && <Text style={s.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[s.btn, !canSubmit && s.btnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
          testID="button-complete-onboarding"
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={s.btnText}>Get Locked In →</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      paddingHorizontal: 24,
      paddingBottom: 60,
    },
    logo: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 22,
      letterSpacing: 1.5,
      marginBottom: 20,
      marginTop: 8,
    },
    logoWhite: { color: colors.foreground },
    logoGreen: { color: colors.primary },
    title: {
      fontFamily: "BarlowCondensed_900Black",
      fontSize: 48,
      lineHeight: 48,
      color: colors.foreground,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    titleAccent: { color: colors.primary },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginBottom: 28,
    },
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 24,
      gap: 24,
    },
    field: { gap: 10 },
    label: {
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: colors.mutedForeground,
    },
    input: {
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 13,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontFamily: "Inter_500Medium",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    chipTextActive: { color: colors.primaryForeground },
    levelList: { gap: 8 },
    levelRow: {
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    levelRowActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    levelText: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: colors.mutedForeground,
    },
    levelTextActive: { color: colors.primaryForeground },
    errorText: {
      color: colors.destructive,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      textAlign: "center",
    },
    btn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    btnDisabled: { opacity: 0.4 },
    btnText: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 16,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.primaryForeground,
    },
  });
