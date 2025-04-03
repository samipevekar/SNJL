import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

const { width } = Dimensions.get("window");
const scale = width / 375;

const ApplyJob = () => {
  const theme = useSelector((state) => state.theme.mode);
  const navigation = useNavigation();
  const route = useRoute();
  const { job } = route.params; // Get the job data passed from JobDetails.jsx

  // State for form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [resume, setResume] = useState(null);

  const handleSubmit = () => {
    // Basic validation
    if (!firstName || !lastName || !phone || !email || !location || !resume) {
      Alert.alert("Error", "Please fill out all fields and upload a resume.");
      return;
    }

    // Simulate form submission (e.g., API call)
    Alert.alert("Success", `Application submitted for ${job.jobTitle} at ${job.companyName}!`);
    navigation.navigate("AppliedJobs"); // Navigate to AppliedJobs after submission
  };

  const handleUploadResume = () => {
    // Simulate resume upload (in a real app, you'd use a file picker library like react-native-document-picker)
    setResume("resume.pdf"); // Mock a file name for now
    Alert.alert("Resume Uploaded", "Resume uploaded successfully!");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === "light" ? "#111" : "#f9f9f9" }]}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Apply</Text>
        <View style={styles.profileHeader}>
          <View style={styles.profileImage} />
          <View>
            <Text style={styles.userName}>user name</Text>
            <Text style={styles.userDetails}>Education</Text>
            <Text style={styles.userDetails}>Location</Text>
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="first name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="last name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="phone no."
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="email id."
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="location*"
          value={location}
          onChangeText={setLocation}
        />

        {/* <Text style={styles.sectionTitle}>Resume</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadResume}>
          <Text style={styles.uploadButtonText}>
            {resume ? resume : "Upload resume"}
          </Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
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
    paddingBottom: 70, 
  },
  title: {
    fontSize: 20 * scale,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 60 * scale,
    height: 60 * scale,
    backgroundColor: "#ddd",
    borderRadius: 30 * scale,
    marginRight: 12,
  },
  userName: {
    fontSize: 16 * scale,
    fontWeight: "bold",
    color: "#000",
  },
  userDetails: {
    fontSize: 14 * scale,
    color: "#555",
  },
  input: {
    backgroundColor: "#555",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14 * scale,
    color: "#000",
  },
  sectionTitle: {
    fontSize: 16 * scale,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadButtonText: {
    fontSize: 14 * scale,
    color: "#555",
  },
  submitButton: {
    backgroundColor: "#34C759",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-end",
  },
  submitButtonText: {
    fontSize: 14 * scale,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ApplyJob;