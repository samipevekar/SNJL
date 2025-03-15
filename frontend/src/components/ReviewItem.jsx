import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import PostHeader from './PostHeader';
// import { theme } from '../theme/themes';

const ReviewItem = ({ review, theme, userData }) => {
  
  const [isExpanded, setIsExpanded] = useState(false); // State to track if content is expanded

  // Toggle between showing more or less content
  const toggleContent = () => {
    setIsExpanded(!isExpanded);
  };

  // Ensure review and review.content are defined before accessing length
  const content = review?.content || ""; // Fallback to empty string if undefined
  const shouldShowMoreButton = content.length > 100; // Safely check length

  // If review or userData is undefined, return null or a fallback UI
  if (!review || !userData) {
    return <View style={styles.reviewItem}><Text style={{ color: theme === "light" ? "#000000" : "#FFFFFF" }}>Invalid review data</Text></View>;
  }

  return (<>
    <View styles={{ }}><View style={[styles.reviewItem , ]}>
      {/* Review Header */}
      <View
        style={[
          styles.reviewHeader,
          {
            
            borderRadius: 8,
            padding: 7,
            marginBottom: 12,
          },
        ]}
      >
      
        <PostHeader userData={userData} theme={theme} posts={review}/>
      </View>

      {/* Review Content */}
      <View style={styles.reviewContentContainer}>
        <Text
          style={[
            styles.reviewText,
            { color: theme === "light" ? "#000000" : "#FFFFFF" },
          ]}
          numberOfLines={isExpanded ? undefined : 3} // Show 3 lines initially
          ellipsizeMode="tail"
        >
          {content}
        </Text>
      </View>

      {/* Show More/Show Less Button */}
      {shouldShowMoreButton && (
        <TouchableOpacity onPress={toggleContent}>
          <Text
            style={[
              styles.showMoreText,
              {
                color: theme === "light" ? "#34A853" : "#4CAF50",
              },
            ]}
          >
            {isExpanded ? "Show less" : "Show more"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Action Buttons (Reachion and Icons) */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={[styles.reachionButton,{borderColor: theme === "light" ? "#34A853" : "#4CAF50",}]}>
          <Text
            style={[
              styles.reachionText,
              { color: theme === "light" ? "#34A853" : "#4CAF50" },
            ]}
          >
            Reaction
          </Text>
        </TouchableOpacity>
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.actionIcon}>
            <Icon name="favorite" size={20} color={theme === "light" ? "#34A853" : "#4CAF50"} />
            <Text style={[styles.iconText, { color: theme === "light" ? "#666" : "#999" }]}>15</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Icon name="chat-bubble-outline" size={20} color={theme === "light" ? "#34A853" : "#4CAF50"} />
            <Text style={[styles.iconText, { color: theme === "light" ? "#666" : "#999" }]}>15</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Icon name="bookmark-border" size={20} color={theme === "light" ? "#34A853" : "#4CAF50"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Icon name="share" size={20} color={theme === "light" ? "#34A853" : "#4CAF50"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
   
    </View>
   
    </>
  );
};

const styles = StyleSheet.create({
  reviewItem: {
    marginBottom: 24,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  reviewUsername: {
    fontSize: 16,
    fontWeight: '700',
  },
  reviewHandle: {
    fontSize: 14,
  },
  moreButton: {
    padding: 4,
  },
  reviewContentContainer: {
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 16,
    lineHeight: 24,
  },
  showMoreText: {
    fontSize: 14,
    marginBottom: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reachionButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    
    borderRadius: 16,
  },
  reachionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  iconText: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default ReviewItem;