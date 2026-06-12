import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";

type CheckinRow = {
  id: string;
  type: string;
  focus_score: number;
  confidence_score: number;
  energy_score: number;
  note: string | null;
  is_public: boolean;
  created_at: string;
};

function ScorePicker({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const colors = useColors();
  const s = scorePickerStyles(colors);
  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.value}>{value}</Text>
      </View>
      <Text style={s.sublabel}>{sublabel}</Text>
      <View style={s.buttons}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <TouchableOpacity
            key={n}
            style={[s.btn, n === value && s.btnActive]}
            onPress={() => {
              onChange(n);
              Haptics.selectionAsync();
            }}
            activeOpacity={0.7}
          >
            <Text style={[s.btnText, n === value && s.btnTextActive]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function scorePickerStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 2,
    },
    label: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 15,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.foreground,
    },
    value: {
      fontFamily: "BarlowCondensed_900Black",
      fontSize: 32,
      color: colors.primary,
    },
    sublabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginBottom: 12,
    },
    buttons: {
      flexDirection: "row",
      gap: 4,
    },
    btn: {
      flex: 1,
      height: 34,
      borderRadius: 6,
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    btnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    btnText: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 13,
      color: colors.mutedForeground,
    },
    btnTextActive: {
      color: colors.primaryForeground,
    },
  });
}

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: 12 }}>
      <View
        style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}
      >
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 11,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: colors.mutedForeground,
          }}
        >
          {label}
        </Text>
        <Text style={{ fontFamily: "BarlowCondensed_700Bold", fontSize: 18, color }}>
          {value}
          <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>/10</Text>
        </Text>
      </View>
      <View
        style={{
          height: 4,
          backgroundColor: colors.muted,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${(value / 10) * 100}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
}

export default function CheckinScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [todayPre, setTodayPre] = useState<CheckinRow | null>(null);
  const [todayPost, setTodayPost] = useState<CheckinRow | null>(null);
  const [preSaved, setPreSaved] = useState(false);
  const [postSaved, setPostSaved] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalCheckins, setTotalCheckins] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [focus, setFocus] = useState(7);
  const [confidence, setConfidence] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [preNote, setPreNote] = useState("");
  const [prePublic, setPrePublic] = useState(true);
  const [preSubmitting, setPreSubmitting] = useState(false);
  const [preError, setPreError] = useState<string | null>(null);

  const [performance, setPerformance] = useState(7);
  const [lockIn, setLockIn] = useState(7);
  const [improvement, setImprovement] = useState("");
  const [postPublic, setPostPublic] = useState(true);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    const [preRes, postRes, allRes] = await Promise.all([
      supabase
        .from("checkins")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "pre")
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`)
        .maybeSingle(),
      supabase
        .from("checkins")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "post")
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`)
        .maybeSingle(),
      supabase
        .from("checkins")
        .select("created_at")
        .eq("user_id", user.id)
        .eq("type", "pre")
        .order("created_at", { ascending: false }),
    ]);

    if (preRes.data) setTodayPre(preRes.data);
    if (postRes.data) setTodayPost(postRes.data);

    if (allRes.data) {
      setTotalCheckins(allRes.data.length);
      const days = new Set(allRes.data.map((r: any) => r.created_at.slice(0, 10)));
      const todayKey = new Date().toISOString().slice(0, 10);
      const cursor = new Date();
      cursor.setUTCHours(0, 0, 0, 0);
      if (!days.has(todayKey)) cursor.setUTCDate(cursor.getUTCDate() - 1);
      let count = 0;
      while (true) {
        const key = cursor.toISOString().slice(0, 10);
        if (!days.has(key)) break;
        count++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }
      setStreak(count);
    }
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const submitPre = async () => {
    if (!user || !profile || preSubmitting) return;
    setPreSubmitting(true);
    setPreError(null);
    const { data, error } = await supabase
      .from("checkins")
      .insert({
        user_id: user.id,
        sport: profile.sport,
        type: "pre",
        focus_score: focus,
        confidence_score: confidence,
        energy_score: energy,
        note: preNote.trim() || null,
        is_public: prePublic,
      })
      .select()
      .single();
    setPreSubmitting(false);
    if (error) {
      setPreError("Something went wrong. Try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setTodayPre(data);
      setPreSaved(true);
      setTotalCheckins((t) => t + 1);
      setStreak((s) => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const submitPost = async () => {
    if (!user || !profile || postSubmitting) return;
    setPostSubmitting(true);
    setPostError(null);
    const { data, error } = await supabase
      .from("checkins")
      .insert({
        user_id: user.id,
        sport: profile.sport,
        type: "post",
        focus_score: performance,
        confidence_score: lockIn,
        energy_score: 0,
        note: improvement.trim() || null,
        is_public: postPublic,
      })
      .select()
      .single();
    setPostSubmitting(false);
    if (error) {
      setPostError("Something went wrong. Try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setTodayPost(data);
      setPostSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const s = styles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <View style={[s.container, { paddingTop: topPad, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[s.container, { paddingTop: topPad }]}
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Streak Hero */}
      <View style={s.hero}>
        <Text style={s.heroDate}>{dateStr}</Text>
        <Text style={s.heroStreak}>{streak}</Text>
        <Text style={s.heroLabel}>day streak</Text>
        <View style={s.heroMeta}>
          <Text style={s.heroCount}>
            <Text style={s.heroCountNum}>{totalCheckins}</Text> pre-game check-ins
          </Text>
          {profile?.sport && (
            <View style={s.sportBadge}>
              <Text style={s.sportBadgeText}>{profile.sport}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Pre-Game */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>
            Pre-Game <Text style={s.sectionAccent}>Check-In</Text>
          </Text>
          <Text style={s.sectionSub}>Counts toward your streak · 1 per day</Text>
        </View>

        {todayPre ? (
          <View style={s.doneCard}>
            <View style={s.doneHeader}>
              <View style={[s.dot, { backgroundColor: colors.primary }]} />
              <Text style={s.doneTitle}>
                {preSaved ? "Locked in" : "Already checked in today"}
              </Text>
            </View>
            <ScoreBar label="Focus" value={todayPre.focus_score} color={colors.primary} />
            <ScoreBar label="Confidence" value={todayPre.confidence_score} color={colors.blue} />
            <ScoreBar label="Energy" value={todayPre.energy_score} color={colors.amber} />
            {todayPre.note && (
              <Text style={s.doneNote}>"{todayPre.note}"</Text>
            )}
            {preSaved && (
              <View style={[s.savedBanner, { borderColor: colors.primary + "40", backgroundColor: colors.primary + "18" }]}>
                <Text style={[s.savedText, { color: colors.primary }]}>
                  Pre-game check-in saved
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={s.formCard}>
            <ScorePicker
              label="Focus"
              sublabel="How sharp is your focus today?"
              value={focus}
              onChange={setFocus}
            />
            <ScorePicker
              label="Confidence"
              sublabel="How confident do you feel?"
              value={confidence}
              onChange={setConfidence}
            />
            <ScorePicker
              label="Energy"
              sublabel="How is your energy level right now?"
              value={energy}
              onChange={setEnergy}
            />

            <View style={s.noteCard}>
              <Text style={s.noteLabel}>
                Notes <Text style={s.noteOptional}>(optional)</Text>
              </Text>
              <TextInput
                style={s.noteInput}
                value={preNote}
                onChangeText={setPreNote}
                placeholder="What's on your mind? Any context about today..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={s.overallRow}>
              <Text style={s.overallLabel}>Overall</Text>
              <Text style={s.overallValue}>
                {Math.round(((focus + confidence + energy) / 3) * 10) / 10}
              </Text>
            </View>

            <View style={s.shareRow}>
              <View>
                <Text style={s.shareTitle}>Share anonymously</Text>
                <Text style={s.shareSub}>
                  {prePublic ? "Visible in community feed" : "Private only"}
                </Text>
              </View>
              <Switch
                value={prePublic}
                onValueChange={setPrePublic}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            {preError && <Text style={s.errorText}>{preError}</Text>}

            <TouchableOpacity
              style={[s.submitBtn, preSubmitting && s.btnDisabled]}
              onPress={submitPre}
              disabled={preSubmitting}
              activeOpacity={0.85}
            >
              {preSubmitting ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={s.submitBtnText}>Submit Pre-Game →</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Post-Game */}
      <View style={[s.section, { marginBottom: 40 }]}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>
            Post-Game <Text style={[s.sectionAccent, { color: colors.blue }]}>Check-In</Text>
          </Text>
          <Text style={s.sectionSub}>Optional · Doesn't affect streak</Text>
        </View>

        {todayPost ? (
          <View style={s.doneCard}>
            <View style={s.doneHeader}>
              <View style={[s.dot, { backgroundColor: colors.blue }]} />
              <Text style={s.doneTitle}>
                {postSaved ? "Post-game logged" : "Post-game already logged today"}
              </Text>
            </View>
            <ScoreBar label="Performance" value={todayPost.focus_score} color={colors.blue} />
            <ScoreBar label="Mental Lock-In" value={todayPost.confidence_score} color={colors.primary} />
            {todayPost.note && (
              <>
                <Text style={[s.noteLabel, { marginTop: 8 }]}>Improve next time</Text>
                <Text style={s.doneNote}>"{todayPost.note}"</Text>
              </>
            )}
            {postSaved && (
              <View style={[s.savedBanner, { borderColor: colors.blue + "40", backgroundColor: colors.blue + "18" }]}>
                <Text style={[s.savedText, { color: colors.blue }]}>Post-game check-in saved</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={s.formCard}>
            <ScorePicker
              label="Performance"
              sublabel="How did you perform today?"
              value={performance}
              onChange={setPerformance}
            />
            <ScorePicker
              label="Mental Lock-In"
              sublabel="Did you feel mentally locked in?"
              value={lockIn}
              onChange={setLockIn}
            />

            <View style={s.noteCard}>
              <Text style={s.noteLabel}>One thing to improve</Text>
              <TextInput
                style={s.noteInput}
                value={improvement}
                onChangeText={setImprovement}
                placeholder="What's one thing you want to work on next time?"
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={s.shareRow}>
              <View>
                <Text style={s.shareTitle}>Share anonymously</Text>
                <Text style={s.shareSub}>
                  {postPublic ? "Visible in community feed" : "Private only"}
                </Text>
              </View>
              <Switch
                value={postPublic}
                onValueChange={setPostPublic}
                trackColor={{ false: colors.border, true: colors.blue }}
                thumbColor={colors.background}
              />
            </View>

            {postError && <Text style={s.errorText}>{postError}</Text>}

            <TouchableOpacity
              style={[s.submitBtnOutline, postSubmitting && s.btnDisabled]}
              onPress={submitPost}
              disabled={postSubmitting}
              activeOpacity={0.85}
            >
              {postSubmitting ? (
                <ActivityIndicator color={colors.blue} />
              ) : (
                <Text style={[s.submitBtnText, { color: colors.blue }]}>
                  Submit Post-Game →
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20 },
    hero: {
      alignItems: "center",
      paddingVertical: 32,
    },
    heroDate: {
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: colors.mutedForeground,
      marginBottom: 8,
    },
    heroStreak: {
      fontFamily: "BarlowCondensed_900Black",
      fontSize: 96,
      lineHeight: 96,
      color: colors.primary,
      letterSpacing: -2,
    },
    heroLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    heroMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 16,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    heroCount: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
    },
    heroCountNum: {
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    sportBadge: {
      backgroundColor: colors.primary + "20",
      borderWidth: 1,
      borderColor: colors.primary + "40",
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    sportBadgeText: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 11,
      letterSpacing: 1,
      color: colors.primary,
      textTransform: "uppercase",
    },
    section: { marginBottom: 24 },
    sectionHeader: { marginBottom: 14 },
    sectionTitle: {
      fontFamily: "BarlowCondensed_900Black",
      fontSize: 30,
      textTransform: "uppercase",
      color: colors.foreground,
      lineHeight: 32,
    },
    sectionAccent: { color: colors.primary },
    sectionSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    formCard: { gap: 10 },
    doneCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 20,
    },
    doneHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    doneTitle: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 14,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.foreground,
    },
    doneNote: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      fontStyle: "italic",
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    savedBanner: {
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: "center",
      marginTop: 12,
    },
    savedText: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
    },
    noteCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
    },
    noteLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: colors.mutedForeground,
      marginBottom: 10,
    },
    noteOptional: {
      textTransform: "none",
      letterSpacing: 0,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      opacity: 0.6,
    },
    noteInput: {
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 70,
      textAlignVertical: "top",
    },
    overallRow: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    overallLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: colors.mutedForeground,
    },
    overallValue: {
      fontFamily: "BarlowCondensed_900Black",
      fontSize: 32,
      color: colors.primary,
    },
    shareRow: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    shareTitle: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: colors.foreground,
    },
    shareSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    errorText: {
      color: colors.destructive,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      textAlign: "center",
    },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    submitBtnOutline: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.blue + "50",
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    btnDisabled: { opacity: 0.4 },
    submitBtnText: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 16,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.primaryForeground,
    },
  });
