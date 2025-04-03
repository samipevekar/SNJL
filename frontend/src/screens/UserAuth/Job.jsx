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
import { useNavigation, useRoute } from "@react-navigation/native";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

const { width } = Dimensions.get("window");
const scale = width / 375;

const Job = () => {
  const theme = useSelector((state) => state.theme.mode);
  const navigation = useNavigation();
  const route = useRoute();

  const jobData = [
    {
      title: "Engineer",
      count: "02",
      data: [
        {
          companyName: "Tech Corp",
          jobTitle: "Software Engineer",
          location: "New York, NY",
          onSite: true,
          timeAgo: "3days ago",
          applicants: 20,
          about: "This is a software engineering role focused on building scalable web applications.",
          responsibilities: "Develop and maintain web applications, collaborate with cross-functional teams.",
          experience: "3+ years of experience in software development, proficiency in JavaScript and React.",
        },
        {
          companyName: "Innovate Solutions",
          jobTitle: "Backend Developer",
          location: "San Francisco, CA",
          onSite: true,
          timeAgo: "3days ago",
          applicants: 15,
          about: "Backend developer role to design and implement server-side logic.",
          responsibilities: "Build RESTful APIs, manage databases, ensure system scalability.",
          experience: "5+ years of experience, expertise in Node.js and SQL.",
        },
      ],
    },
    {
      title: "Designer",
      count: "04",
      data: [
        {
          companyName: "Design Studio",
          jobTitle: "Graphic Design",
          location: "Los Angeles, CA",
          onSite: true,
          timeAgo: "3days ago",
          applicants: 25,
          about: "Create visually appealing designs for marketing campaigns.",
          responsibilities: "Design graphics for print and digital media, collaborate with marketing team.",
          experience: "2+ years of graphic design experience, proficiency in Adobe Creative Suite.",
        },
        {
          companyName: "Creative Agency",
          jobTitle: "Apparel Design",
          location: "Chicago, IL",
          onSite: true,
          timeAgo: "3days ago",
          applicants: 30,
          about: "Design apparel for a leading fashion brand.",
          responsibilities: "Create apparel designs, work with production teams, ensure quality standards.",
          experience: "4+ years in apparel design, knowledge of fashion trends.",
        },
        {
          companyName: "Fashion House",
          jobTitle: "Footwear Design",
          location: "Miami, FL",
          onSite: true,
          timeAgo: "3days ago",
          applicants: 18,
          about: "Design innovative footwear for a global brand.",
          responsibilities: "Sketch footwear designs, select materials, oversee prototyping.",
          experience: "3+ years in footwear design, strong sketching skills.",
        },
        {
          companyName: "Product Co",
          jobTitle: "Product Design",
          location: "Seattle, WA",
          onSite: true,
          timeAgo: "3days ago",
          applicants: 22,
          about: "Design user-centered products for a tech company.",
          responsibilities: "Create product prototypes, conduct user testing, iterate designs.",
          experience: "5+ years in product design, experience with UX/UI tools.",
        },
      ],
    },
  ];

  // Render each job item
  const renderJobItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("JobDetails", { job: item })}
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

  // Render section header (e.g., "Engineer 02")
  const renderSectionHeader = ({ section: { title, count } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme === "light" ? "#111" : "#f9f9f9" }]}
    >
      {/* Header Component */}
      <Header />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabTextActive}>Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text
            onPress={() => navigation.navigate("AppliedJobs")}
            style={styles.tabText}
          >
            Applied
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-list" size={18 * scale} color="#000" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Job List */}
      <SectionList
        sections={jobData}
        keyExtractor={(item, index) => item.jobTitle + index}
        renderItem={renderJobItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
      />

      {/* Footer Component */}
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
    paddingBottom: 70, // Space for the footer
  },
});

export default Job;