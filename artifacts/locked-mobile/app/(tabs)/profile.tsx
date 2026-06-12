import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";

function StatRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    }}>
      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: colors.mutedForeground }}>
        {label}
      </Text>
      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: colors.foreground }}>
        {value}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const handleSignOut = async () => {
    if (Platform.OS === "web") {
      await signOut();
      return;
    }
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.selectionAsync();
          await signOut();
        },
      },
    ]);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const s = styles(colors);

  return (
    <ScrollView
      style={[s.container, { paddingTop: topPad }]}
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.header}>
        <Text style={s.headerEyebrow}>Athlete</Text>
        <Text style={s.headerTitle}>
          Your <Text style={s.headerAccent}>Profile</Text>
        </Text>
      </View>

      {profile ? (
        <>
          <View style={s.avatarSection}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>
                {(profile.handle || "?")[0].toUpperCase()}
              </Text>
            </View>
            <Text style={s.handleText}>{profile.handle}</Text>
            <View style={s.sportBadge}>
              <Text style={s.sportBadgeText}>{profile.sport}</Text>
            </View>
          </View>

          <View style={s.card}>
            <StatRow label="Sport" value={profile.sport} />
            <StatRow label="Level" value={profile.level} />
            <StatRow label="Handle" value={profile.handle} />
            <View style={{ paddingTop: 14 }}>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground }}>
                {user?.email}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={s.card}>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.mutedForeground }}>
            {user?.email}
          </Text>
        </View>
      )}

      <View style={s.actions}>
        <TouchableOpacity
          style={s.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
          testID="button-sign-out"
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={[s.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }]}>
        <Text style={s.footerText}>
          <Text style={{ color: colors.foreground }}>Locke</Text>
          <Text style={{ color: colors.primary }}>d</Text>
          {" "}— Mental performance for athletes.
        </Text>
        <Text style={s.footerSub}>Community feed is fully anonymous.</Text>
      </View>
    </ScrollView>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20 },
    header: {
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 24,
    },
    headerEyebrow: {
      fontFamily: "Inter_500Medium",
      fontSize: 10,
      letterSpacing: 2.5,
      textTransform: "uppercase",
      color: colors.mutedForeground,
      marginBottom: 4,
    },
    headerTitle: {
      fontFamily: "BarlowCondensed_900Black",
      fontSize: 40,
      textTransform: "uppercase",
      color: colors.foreground,
      lineHeight: 42,
    },
    headerAccent: { color: colors.primary },
    avatarSection: {
      alignItems: "center",
      marginBottom: 28,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary + "20",
      borderWidth: 2,
      borderColor: colors.primary + "40",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    avatarText: {
      fontFamily: "BarlowCondensed_900Black",
      fontSize: 32,
      color: colors.primary,
    },
    handleText: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 22,
      color: colors.foreground,
      letterSpacing: 1,
      marginBottom: 8,
    },
    sportBadge: {
      backgroundColor: colors.primary + "18",
      borderWidth: 1,
      borderColor: colors.primary + "30",
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 5,
    },
    sportBadgeText: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 13,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: colors.primary,
    },
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    actions: { gap: 10, marginBottom: 40 },
    signOutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.destructive + "40",
      borderRadius: 12,
      paddingVertical: 14,
    },
    signOutText: {
      fontFamily: "Inter_500Medium",
      fontSize: 15,
      color: colors.destructive,
    },
    footer: {
      alignItems: "center",
      gap: 4,
    },
    footerText: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
    },
    footerSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
      opacity: 0.6,
    },
  });
