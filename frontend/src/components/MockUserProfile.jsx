import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
// import ReviewItem from './ReviewItem';
import { useDispatch, useSelector } from 'react-redux';
import ReviewItem from './ReviewItem';
import { getUserData } from '../storage/userData';

const MockUserProfile = () => {
  const [userData ,setUserData] = useState({});
  const dispatch = useDispatch();
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


    useEffect(() => {
      const loadData = async () => {
        try {
          const user = await getUserData();
          setUserData(user);
          // console.log("usenvb",user)
          
        } catch (err) {
          console.error("Error loading user data:", err);
        }
      };
      loadData();
    }, [dispatch]);

  const renderReviewItem = ({ item }) => (
    <>
    <ReviewItem
      review={item}
      theme={theme} // Matches the image (dark theme)
      userData={userData}
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