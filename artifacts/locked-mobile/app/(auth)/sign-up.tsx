import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { useColors } from "@/hooks/useColors";

export default function SignUp() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (!data.session) {
      setMessage("Check your email to confirm your account, then sign in.");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const s = styles(colors);
  const canSubmit = !!email && !!password && !loading;

  return (
    <KeyboardAvoidingView
      style={[s.container, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <Text style={s.logo}>
            <Text style={s.logoWhite}>Locke</Text>
            <Text style={s.logoGreen}>d</Text>
          </Text>
          <Text style={s.title}>
            Join the{"\n"}
            <Text style={s.titleAccent}>game.</Text>
          </Text>
          <Text style={s.subtitle}>Track your mental performance.</Text>
        </View>

        {message ? (
          <View style={s.messageCard}>
            <Text style={s.messageText}>{message}</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")} style={s.btn}>
              <Text style={s.btnText}>Go to Sign In →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.form}>
            <View style={s.field}>
              <Text style={s.label}>Email</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="athlete@email.com"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                testID="input-email"
              />
            </View>

            <View style={s.field}>
              <Text style={s.label}>Password</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
                testID="input-password"
              />
            </View>

            {error && <Text style={s.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[s.btn, !canSubmit && s.btnDisabled]}
              onPress={handleSignUp}
              disabled={!canSubmit}
              activeOpacity={0.85}
              testID="button-sign-up"
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={s.btnText}>Create Account →</Text>
              )}
            </TouchableOpacity>

            <View style={s.switchRow}>
              <Text style={s.switchText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
                <Text style={s.switchLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 40,
    },
    logo: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 22,
      letterSpacing: 1.5,
      marginBottom: 28,
    },
    logoWhite: { color: colors.foreground },
    logoGreen: { color: colors.primary },
    title: {
      fontFamily: "BarlowCondensed_900Black",
      fontSize: 56,
      lineHeight: 56,
      color: colors.foreground,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    titleAccent: { color: colors.primary },
    subtitle: {
      fontSize: 15,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    form: { gap: 16 },
    messageCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 24,
      gap: 20,
      alignItems: "center",
    },
    messageText: {
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      textAlign: "center",
      lineHeight: 22,
    },
    field: { gap: 8 },
    label: {
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: colors.mutedForeground,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 15,
    },
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
      marginTop: 8,
      width: "100%",
    },
    btnDisabled: { opacity: 0.4 },
    btnText: {
      fontFamily: "BarlowCondensed_700Bold",
      fontSize: 16,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.primaryForeground,
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 4,
    },
    switchText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
    },
    switchLink: {
      color: colors.primary,
      fontFamily: "Inter_500Medium",
      fontSize: 14,
    },
  });
