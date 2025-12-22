import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function Help() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Help & Support
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Get help and find answers to common questions
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Getting Started
          </Text>
          <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
            Learn how to navigate the app, use UI components, and make the most of your experience.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Troubleshooting
          </Text>
          <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
            Common issues and solutions to help you resolve problems quickly.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Contact Support
          </Text>
          <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
            Need additional help? Reach out to our support team for personalized assistance.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
