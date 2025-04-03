import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  searchUsers,
  fetchSearchHistory,
  deleteSearchHistory,
  clearSearch,
} from "../store/slices/searchSlice";
import Footer from "../components/Footer";

const { width } = Dimensions.get("window");
const scale = width / 375;


export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { searchResults, searchHistory, loading, error, historyPagination } = useSelector(
    (state) => state.search
  );
const theme = useSelector((state) => state.theme.mode);
  // Fetch initial search history when focused
  useEffect(() => {
    if (isFocused && searchHistory.length === 0) {
      dispatch(fetchSearchHistory({ page: 1, limit: 10 }));
    }
  }, [isFocused, dispatch]);

  // Handle search input
  const handleSearch = (text) => {
    setQuery(text || "");
    if (text && text.trim().length > 0) {
      dispatch(searchUsers(text)); // Only dispatch searchUsers with a valid query
    } else {
      dispatch(clearSearch()); // Clear results when query is empty
    }
  };

  // Save query to history when search icon is pressed
  const handleSearchIconPress = () => {
    if (query.trim().length > 0) {
      dispatch(searchUsers(query));
    }
  };

  // Navigate to user profile and save to history
  const navigateToProfile = (user) => {
    const displayName = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
    dispatch(searchUsers(displayName));
    navigation.navigate("ViewProfile", { user });
    setQuery("");
    setIsFocused(false);
  };

  // Delete individual search history
  const handleDeleteHistory = (searchId) => {
    console.log("searchId", searchId);
    dispatch(deleteSearchHistory({ searchId }));
  };

  // Load more history on scroll
  const loadMoreHistory = () => {
    if (!loading && historyPage < historyPagination.totalPages) {
      const nextPage = historyPage + 1;
      dispatch(fetchSearchHistory({ page: nextPage, limit: 10 }));
      setHistoryPage(nextPage);
    }
  };

  // Render search history item
  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <TouchableOpacity
        style={styles.historyTextContainer}
        onPress={() => {
          setQuery(item.query);
          handleSearch(item.query);
        }}
      >
        <Icon name="history" size={18 * scale} color="#888" style={styles.historyIcon} />
        <Text style={[styles.historyText,{color:theme==='light'?'#000000':'#FFFFFF'}]}>{item.query}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteHistory(item._id)}>
        <Icon name="close" size={18 * scale} color="#888" style={styles.deleteIcon} />
      </TouchableOpacity>
    </View>
  );

  // Render search result item with full details
  const renderSearchResult = ({ item }) => {
    const hasProfileImage = item.profileImage && item.profileImage.startsWith("http");
    const displayName = item.name || `${item.firstName || ""} ${user.lastName || ""}`.trim() || item.email;

    return (
      <TouchableOpacity style={styles.resultItem} onPress={() => navigateToProfile(item)}>
        <View style={styles.resultContent}>
          {hasProfileImage ? (
            <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
          ) : (
           <View > <Image source={require("../../images/AvatarLight.png")}  style={[styles.profileImage] }/></View>
          )}
          <View>
            <Text style={[styles.resultText,{color:theme==='light'?'#000000':'#FFFFFF'}]}>{displayName}</Text>
            <Text style={styles.resultRole}>{item.role}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Tags
  const tags = ["Trending", "Accounts", "Jobs", "Locations", "Companies", "Hashtags"];

  // Dynamic style for search icon position
  const getSearchIconStyle = () => ({
    position: "absolute",
    right: query.length > 0 ? 30 * scale : 10 * scale,
  });

  return (
    <>
    <View style={[styles.container,{backgroundColor:theme==='light'?'#fff':'#000'}]}>
      {/* Search Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input] }
          placeholder="Search..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(query.length > 0)}
        />
        <TouchableOpacity style={getSearchIconStyle()} onPress={handleSearchIconPress}>
          <Icon name="search" size={18 * scale} color="#888" />
        </TouchableOpacity>
        {query.length > 0 && (
          <TouchableOpacity style={styles.clearIcon} onPress={() => setQuery("")}>
            <Icon name="close" size={18 * scale} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search History or Results */}
      {isFocused ? (
        <View style={styles.historyContainer}>
          {query.length === 0 && searchHistory.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle,{color:theme==='light'?'#000000':'#FFFFFF'}]}>Recent</Text>
              <FlatList
                data={searchHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item._id}
                onEndReached={loadMoreHistory}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  loading && historyPage > 1 ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : null
                }
              />
            </>
          ) : loading && query.length > 0 ? (
            <ActivityIndicator size="large" color={theme==='light'?'#000000':'#FFFFFF'} style={styles.loading} />
          ) : error && query.length > 0 ? ( // Only show error when there's a query
            <Text style={styles.errorText}>{error}</Text>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item._id || item.email}
            />
          ) : query.length > 0 ? (
            <Text style={styles.noResultsText}>No results found</Text>
          ) : null}
        </View>
      ) : (
        <>
          {/* Tags */}
         <View style={{ height: 40 }}> <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.tagsContainer,]}
            contentContainerStyle={[styles.tagsContent,]}
          >
            {tags.map((tag, index) => (
              <TouchableOpacity key={index} style={[styles.tag ,{height:30}]}>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView></View>

          {/* Placeholder for Posts */}
          <View style={styles.postsContainer}>
            <Text style={styles.placeholderText}>Posts will be displayed here (to be implemented)</Text>
          </View>
        </>
      )}
    </View>
 <Footer style={{ position: "absolute", bottom: 0, zIndex: 1}}/>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10 * scale,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10 * scale,
    marginBottom: 10 * scale,
  },
  input: {
    flex: 1,
    height: 40 * scale,
    backgroundColor: "#f0f0f0",
    borderRadius: 20 * scale,
    paddingHorizontal: 15 * scale,
    fontSize: 16 * scale,
    color: "#000",
  },
  clearIcon: {
    position: "absolute",
    right: 10 * scale,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 10 * scale,
  },
  sectionTitle: {
    fontSize: 16 * scale,
    fontWeight: "bold",
    color: "#000",
    marginVertical: 10 * scale,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10 * scale,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  historyTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  historyIcon: {
    marginRight: 10 * scale,
  },
  historyText: {
    fontSize: 16 * scale,
    color: "#000",
  },
  resultItem: {
    paddingVertical: 10 * scale,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 30 * scale,
    height: 30 * scale,
    borderRadius: 15 * scale,
    marginRight: 10 * scale,
    borderWidth: 1,
    borderColor: "#34A853",
  },
  avatarIcon: {
    marginRight: 10 * scale,
  },
  resultText: {
    fontSize: 16 * scale,
    color: "#000",
    fontWeight: "500",
  },
  resultRole: {
    fontSize: 12 * scale,
    color: "#888",
  },
  tagsContainer: {
    paddingHorizontal: 10 * scale,
    height:40
  },
  tagsContent: {
    paddingVertical: 2.5 * scale,
    // height:10
  },
  tag: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12 * scale,
    paddingVertical: 4 * scale,
    paddingHorizontal: 12 * scale,
    marginRight: 8 * scale,
    flex:1,
    justifyContent:"center"
  },
  tagText: {
    fontSize: 12 * scale,
    color: "#000",
  },
  postsContainer: {
    flex: 1,
    padding: 10 * scale,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16 * scale,
    color: "#888",
    textAlign: "center",
  },
  loading: {
    marginTop: 20 * scale,
  },
  errorText: {
    fontSize: 16 * scale,
    color: "red",
    textAlign: "center",
    marginTop: 20 * scale,
  },
  noResultsText: {
    fontSize: 16 * scale,
    color: "#888",
    textAlign: "center",
    marginTop: 20 * scale,
  },
  deleteIcon: {
    marginRight: 10 * scale,
  }
});