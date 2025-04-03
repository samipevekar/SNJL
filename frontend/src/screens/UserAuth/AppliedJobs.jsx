import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SectionList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

const { width } = Dimensions.get("window");
const scale = width / 375;

const AppliedJobs = () => {
  const theme = useSelector((state) => state.theme.mode);
  const navigation = useNavigation();

  const appliedJobsData = [
    {
      title: "Applied Jobs",
      count: "02",
      data: [
        {
          companyName: "Tech Corp",
          jobTitle: "Frontend Developer",
          location: "New York, NY",
          onSite: true,
          timeAgo: "Applied 3d ago",
          applicants: 20,
          about: "This is a frontend developer role focused on building user-friendly web interfaces.",
          responsibilities: "Develop responsive web applications, collaborate with designers and backend teams.",
          experience: "2+ years of experience in frontend development, proficiency in React and CSS.",
        },
        {
          companyName: "Design Studio",
          jobTitle: "UI/UX Designer",
          location: "San Francisco, CA",
          onSite: false,
          timeAgo: "Viewed 2d ago",
          applicants: 15,
          about: "UI/UX designer role to create intuitive user experiences.",
          responsibilities: "Design wireframes and prototypes, conduct user research, iterate based on feedback.",
          experience: "3+ years in UI/UX design, expertise in Figma and Adobe XD.",
        },
      ],
    },
  ];

  const renderJobItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("AppliedJobDetails", { job: item })}
    >
      <View style={styles.jobCard}>
        <Text style={styles.companyName}>{item.companyName}</Text>
        <Text style={styles.jobTitle}>{item.jobTitle}</Text>
        <View style={styles.jobDetails}>
          <View style={styles.detailItem}>
            <Icon
              name="check-circle"
              size={14 * scale}
              color={item.onSite ? "#34C759" : "#888"}
            />
            <Text style={styles.detailText}>
              {item.onSite ? "on site" : "remote"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="location-on" size={14 * scale} color="#888" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>
        <Text style={styles.timeAgo}>{item.timeAgo}</Text>
        <TouchableOpacity>
          <Text style={styles.viewDetail}>VIEW DETAIL</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title, count } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme === "light" ? "#111" : "#f9f9f9" }]}>
      <Header />
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.tab}>
          <Text onPress={() => navigation.navigate("Job")} style={styles.tabText}>Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabTextActive}>Applied</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-list" size={18 * scale} color="#000" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>
      <SectionList
        sections={appliedJobsData}
        keyExtractor={(item, index) => item.jobTitle + index}
        renderItem={renderJobItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
      />
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabActive: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#34C759",
  },
  tabText: {
    fontSize: 16 * scale,
    color: "#888",
  },
  tabTextActive: {
    fontSize: 16 * scale,
    color: "#34C759",
    fontWeight: "bold",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  filterText: {
    fontSize: 14 * scale,
    color: "#000",
    marginLeft: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
  },
  sectionTitle: {
    fontSize: 18 * scale,
    fontWeight: "bold",
    color: "#000",
  },
  countBadge: {
    backgroundColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    fontSize: 12 * scale,
    color: "#000",
  },
  jobCard: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 16 * scale,
    fontWeight: "bold",
    color: "#000",
  },
  jobTitle: {
    fontSize: 14 * scale,
    color: "#555",
    marginTop: 2,
  },
  jobDetails: {
    flexDirection: "row",
    marginTop: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  detailText: {
    fontSize: 12 * scale,
    color: "#888",
    marginLeft: 4,
  },
  timeAgo: {
    fontSize: 12 * scale,
    color: "#888",
    marginTop: 8,
  },
  viewDetail: {
    fontSize: 12 * scale,
    color: "#34C759",
    fontWeight: "bold",
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 70,
  },
});

export default AppliedJobs;