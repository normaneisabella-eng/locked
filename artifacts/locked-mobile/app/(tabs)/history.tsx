import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type CheckinRow = {
  id: string;
  type: string;
  focus_score: number;
  confidence_score: number;
  energy_score: number;
  note: string | null;
  created_at: string;
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function HistoryItem({ item }: { item: CheckinRow }) {
  const colors = useColors();
  const isPre = item.type !== "post";
  const overall = isPre
    ? Math.round(((item.focus_score + item.confidence_score + item.energy_score) / 3) * 10) / 10
    : Math.round(((item.focus_score + item.confidence_score) / 2) * 10) / 10;

  const scores = isPre
    ? [
        { k: "F", v: item.focus_score, c: colors.primary },
        { k: "C", v: item.confidence_score, c: colors.blue },
        { k: "E", v: item.energy_score, c: colors.amber },
      ]
    : [
        { k: "Perf", v: item.focus_score, c: colors.blue },
        { k: "Lock", v: item.confidence_score, c: colors.primary },
      ];

  return (
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 8,
    }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: colors.foreground }}>
            {formatDate(item.created_at)}
          </Text>
          {item.note && (
            <Text
              numberOfLines={1}
              style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, fontStyle: "italic", marginTop: 2 }}
            >
              "{item.note}"
            </Text>
          )}
        </View>
        <View style={{
          backgroundColor: isPre ? colors.primary + "20" : colors.blue + "20",
          borderWidth: 1,
          borderColor: isPre ? colors.primary + "30" : colors.blue + "30",
          borderRadius: 6,
          paddingHorizontal: 8,
          paddingVertical: 3,
        }}>
          <Text style={{
            fontFamily: "BarlowCondensed_700Bold",
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: isPre ? colors.primary : colors.blue,
          }}>
            {isPre ? "Pre" : "Post"}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        {scores.map((sc) => (
          <View key={sc.k} style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: "Inter_500Medium", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: colors.mutedForeground }}>
              {sc.k}
            </Text>
            <Text style={{ fontFamily: "BarlowCondensed_900Black", fontSize: 22, color: sc.c, lineHeight: 26 }}>
              {sc.v}
            </Text>
          </View>
        ))}
        <View style={{ borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 16, marginLeft: "auto", alignItems: "center" }}>
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: colors.mutedForeground }}>
            AVG
          </Text>
          <Text style={{ fontFamily: "BarlowCondensed_900Black", fontSize: 22, color: colors.foreground, opacity: 0.7, lineHeight: 26 }}>
            {overall}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<CheckinRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("checkins")
      .select("id, type, focus_score, confidence_score, energy_score, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setCheckins(data ?? []);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const s = styles(colors);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Text style={s.headerEyebrow}>Your data</Text>
        <Text style={s.headerTitle}>
          Mental <Text style={s.headerAccent}>History</Text>
        </Text>
        <Text style={s.headerSub}>Track your patterns. Find your edge.</Text>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : checkins.length === 0 ? (
        <View style={s.emptyContainer}>
          <Text style={s.emptyGhost}>Zero</Text>
          <Text style={s.emptySub}>No check-ins yet. Start your streak today.</Text>
        </View>
      ) : (
        <>
          <Text style={s.listHeader}>
            Last {Math.min(checkins.length, 30)} Check-Ins
          </Text>
          <FlatList
            data={checkins}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <HistoryItem item={item} />}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            contentContainerStyle={{ paddingTop: 4, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        </>
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
    },
    listHeader: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 13,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: colors.foreground,
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 8,
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
      opacity: 0.06,
      letterSpacing: -2,
      marginBottom: 12,
    },
    emptySub: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
    },
  });
