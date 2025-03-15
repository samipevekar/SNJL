import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
// import ReviewItem from './ReviewItem';
import { useSelector } from 'react-redux';
import ReviewItem from './ReviewItem';

const MockUserProfile = () => {
  const theme = useSelector((state) => state.theme.mode);
  // console.log("theme",theme)
  const mockReviews = [
    {
      id: "1",
      content: "This is a great review! I had an amazing experience here and would definitely recommend it to others. The service was excellent, and the atmosphere was fantastic. Can't wait to come back!",
      rating: 4,
    },
    {
      id: "2",
      content: "Enjoying this experience! The food was delicious, and the staff was very friendly.",
      rating: 5,
    },
    {
      id: "3",
      content: "Amazing view, highly recommend! The location is perfect, and the scenery is breathtaking. However, the wait time could be improved.",
      rating: 3,
    },
    {
      id: "4",
      content: "Short review with no extra details.",
      rating: 2,
    },
    {
      id: "5",
      // Missing content to test fallback
      rating: 1,
    },
  ];

  const mockUserData = {
    name: "Sakasham Jaiswal",
    username: "@sakashamjaiswal",
    profileViews: "21.1k",
    following: "32.4k",
    followers: "320.4k",
    career: "Career",
    location: "Location",
    joiningDate: "Joining Date",
    bio: "First, I need to explain what `marginHorizontal` does. From what I remember, `marginHorizontal` is a shorthand property that sets the left and right margins of a component. ",
    avatar:"https://tse1.mm.bing.net/th/id/OET.7252da000e8341b2ba1fb61c275c1f30?w=594&h=594&c=7&rs=1&o=5&pid=1.9"
  };

  const renderReviewItem = ({ item }) => (
    <>
    <ReviewItem
      review={item}
      theme={theme} // Matches the image (dark theme)
      userData={mockUserData}
    />
    <View style={{width:"100%",height:1, backgroundColor: theme === "light" ? "#000000" : "#FFFFFF", marginTop:5}}></View>
    </>
  );

  return (
    <View style={[styles.container  ]}>
      <FlatList
        data={mockReviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reviewsContainer}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5} // Render initial items for performance
        maxToRenderPerBatch={10} // Optimize rendering
        windowSize={21} // Default window size for off-screen items
        ListHeaderComponent={<View style={{ height: 16 }} />} // Optional padding at top
        ListFooterComponent={<View style={{ height: 16 }} />} // Optional padding at bottom
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000', // Matches the dark theme background from the image
  },
  reviewsContainer: {
    padding: 16,
  },
});

export default MockUserProfile;