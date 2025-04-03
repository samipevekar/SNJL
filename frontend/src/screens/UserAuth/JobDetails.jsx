import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

const { width } = Dimensions.get("window");
const scale = width / 375;

const JobDetails = () => {
  const theme = useSelector((state) => state.theme.mode);
  const navigation = useNavigation();
  const route = useRoute();
  const { job } = route.params; 

  const handleApply = () => {
    navigation.navigate("ApplyJob", { job });
  };

  return (
    <View style={[styles.container,{ backgroundColor: theme === "light" ? "#111" : "#f9f9f9" }]}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.jobHeader}>
          <View style={styles.logoPlaceholder} />
          <Text style={styles.companyName}>{job.companyName}</Text>
        </View>
        <Text style={styles.jobTitle}>{job.jobTitle}</Text>
        <View style={styles.jobDetails}>
          <View style={styles.detailItem}>
            <Icon name="location-on" size={14 * scale} color="#34C759" />
            <Text style={styles.detailText}>{job.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon
              name="check-circle"
              size={14 * scale}
              color={job.onSite ? "#34C759" : "#888"}
            />
            <Text style={styles.detailText}>{job.onSite ? "on site" : "remote"}</Text>
          </View>
          <Text style={styles.detailText}>{job.timeAgo}</Text>
          <Text style={styles.detailText}>{job.applicants} applicants</Text>
        </View>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the job</Text>
          <Text style={styles.sectionContent}>{job.about}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Responsibility</Text>
          <Text style={styles.sectionContent}>{job.responsibilities}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <Text style={styles.sectionContent}>{job.experience}</Text>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 70, // Space for the footer
  },
  jobHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logoPlaceholder: {
    width: 50 * scale,
    height: 50 * scale,
    backgroundColor: "#ddd",
    borderRadius: 8,
    marginRight: 12,
  },
  companyName: {
    fontSize: 18 * scale,
    fontWeight: "bold",
    color: "#000",
  },
  jobTitle: {
    fontSize: 16 * scale,
    color: "#555",
    marginBottom: 8,
  },
  jobDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12 * scale,
    color: "#888",
    marginLeft: 4,
  },
  applyButton: {
    backgroundColor: "#34C759",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  applyButtonText: {
    fontSize: 14 * scale,
    color: "#fff",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16 * scale,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14 * scale,
    color: "#555",
    lineHeight: 20 * scale,
  },
});

export default JobDetails;