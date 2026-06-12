import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";

type FeedItem = {
  id: string;
  sport: string;
  focus_score: number;
  confidence_score: number;
  energy_score: number;
  note: string | null;
  created_at: string;
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function FeedCard({ item }: { item: FeedItem }) {
  const colors = useColors();
  const overall = Math.round(((item.focus_score + item.confidence_score + item.energy_score) / 3) * 10) / 10;
  const s = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 10,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    leftRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    sportBadge: {
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    sportText: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.primary,
    },
    time: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
    },
    scores: { flexDirection: "row", alignItems: "center", gap: 12 },
    score: { alignItems: "center" },
    scoreLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 9,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.mutedForeground,
    },
    scoreVal: {
      fontFamily: "BarlowCondensed_900Black",
      fontSize: 22,
    },
    divider: {
      width: 1,
      height: 30,
      backgroundColor: colors.border,
      marginLeft: 4,
    },
    note: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      fontStyle: "italic",
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
    },
  });

  return (
    <View style={s.card}>
      <View style={s.topRow}>
        <View style={s.leftRow}>
          <View style={s.sportBadge}>
            <Text style={s.sportText}>{item.sport}</Text>
          </View>
          <Text style={s.time}>{timeAgo(item.created_at)}</Text>
        </View>
        <View style={s.scores}>
          {[
            { l: "F", v: item.focus_score, c: colors.primary },
            { l: "C", v: item.confidence_score, c: colors.blue },
            { l: "E", v: item.energy_score, c: colors.amber },
          ].map((sc) => (
            <View key={sc.l} style={s.score}>
              <Text style={s.scoreLabel}>{sc.l}</Text>
              <Text style={[s.scoreVal, { color: sc.c }]}>{sc.v}</Text>
            </View>
          ))}
          <View style={s.divider} />
          <View style={s.score}>
            <Text style={s.scoreLabel}>AVG</Text>
            <Text style={[s.scoreVal, { color: colors.foreground }]}>{overall}</Text>
          </View>
        </View>
      </View>
      {item.note && <Text style={s.note}>"{item.note}"</Text>}
    </View>
  );
}

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = useCallback(async () => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("checkins")
      .select("id, sport, focus_score, confidence_score, energy_score, note, created_at")
      .eq("sport", profile.sport)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);
    setItems(data ?? []);
    setLoading(false);
  }, [user, profile]);

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [loadFeed])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const s = styles(colors);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Text style={s.headerEyebrow}>Anonymous</Text>
        <Text style={s.headerTitle}>
          Community <Text style={s.headerAccent}>Feed</Text>
        </Text>
        <Text style={s.headerSub}>
          Real minds. No names.
          {profile?.sport ? ` ${profile.sport} athletes being honest.` : " Just athletes being honest."}
        </Text>
        {profile?.sport && (
          <View style={s.sportBadge}>
            <Text style={s.sportBadgeText}>{profile.sport}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={s.emptyContainer}>
          <Text style={s.emptyGhost}>Quiet</Text>
          <View style={s.emptyCard}>
            <View style={s.emptyDot} />
            <Text style={s.emptyTitle}>No check-ins from your sport yet.</Text>
            <Text style={s.emptySub}>Be the first to share.</Text>
            <TouchableOpacity
              style={s.emptyBtn}
              onPress={() => router.push("/(tabs)/")}
              activeOpacity={0.85}
            >
              <Text style={s.emptyBtnText}>Do Today's Check-In →</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FeedCard item={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!items.length}
        />
      )}
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
    headerSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 4,
      marginBottom: 10,
    },
    sportBadge: {
      alignSelf: "flex-start",
      backgroundColor: colors.primary + "20",
      borderWidth: 1,
      borderColor: colors.primary + "40",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    sportBadgeText: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 12,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.primary,
    },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    emptyGhost: {
      fontFamily: "BarlowCondensed_900Black",
      fontSize: 72,
      textTransform: "uppercase",
      color: colors.foreground,
      opacity: 0.05,
      letterSpacing: -2,
      marginBottom: 24,
    },
    emptyCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.primary + "30",
      borderRadius: 16,
      padding: 28,
      alignItems: "center",
      width: "100%",
      maxWidth: 320,
    },
    emptyDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
      marginBottom: 14,
      shadowColor: colors.primary,
      shadowOpacity: 0.5,
      shadowRadius: 8,
    },
    emptyTitle: {
      fontFamily: "Inter_500Medium",
      fontSize: 15,
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 6,
    },
    emptySub: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 20,
    },
    emptyBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    emptyBtnText: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 14,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.primaryForeground,
    },
  });
