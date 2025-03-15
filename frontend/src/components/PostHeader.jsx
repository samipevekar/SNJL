import {  Dimensions, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { Text } from 'react-native-gesture-handler';
import { useState, useCallback } from 'react';

const { width } = Dimensions.get('window');
const scale = width / 375; // Base width (iPhone 13)
export default function PostHeader({userData,theme ,posts}) {
   

    const avatarUri = typeof userData?.profileImage === "string" && userData?.profileImage.startsWith("http")
      ? userData?.profileImage
      : null;
    // console.log("Avatar URI:", avatarUri);

    const postImageUri = typeof posts.image === "string" && posts.image.startsWith("http")
      ? posts.image
      : null;
  return (
   <View style={[styles.postHeader, { marginBottom: 8 * scale }]}>
             <View style={styles.avatarContainer}>
               {avatarUri ? (
                 <Image
                   source={{ uri: avatarUri }}
                   style={[styles.postAvatar, { width: 40 * scale, height: 40 * scale }]}
                   resizeMode="cover"
                   onError={(error) => console.log("Avatar load error:", error.nativeEvent.error)}
                 />
               ) : (
                 <Icon
                   name="account-circle"
                   size={41 * scale}
                   color={theme === "light" ? '#000000' : '#FFFFFF'}
                 />
               )}
             </View>
   
             <View style={[styles.postHeaderText, { flex: 1  }]}>
               <Text style={[
                 styles.postUsername,
                 { color: theme === "light" ? '#000000' : '#FFFFFF', fontSize: 13 * scale,  }
               ]}>
                 {userData?.name || "Provide your name"} <Text style={{ color: "#34A853", fontSize: 20, fontWeight: "700" }}>•</Text>
               </Text>
               <Text style={[
                 styles.postHandle,
                 { color: theme === "light" ? '#000000' : '#FFFFFF', fontSize: 9 * scale , }
               ]}>
                 @{userData?.username || "Provide username"} • 1hr
               </Text>
             </View>
   
             <TouchableOpacity style={styles.moreButton} onPress={() => handleMoreOptions(item.id)}>
               <Icon name="more-horiz" size={24 * scale} color={theme === "light" ? '#000000' : '#FFFFFF'} />
             </TouchableOpacity>
           </View>
  )
}

const styles = StyleSheet.create({
  postItem: {
    marginBottom: 24 * scale,
    backgroundColor: 'transparent',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  postAvatar: {
    borderRadius: 20 * scale,
    marginRight: 12 * scale,
  },
  postHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  postUsername: {
    fontWeight: '700',
  },
  postHandle: {
    fontSize: 14 * scale,
  },
  postContentContainer: {
    width: '100%',
  },
  postImageContainer: {
    position: 'relative',
  },
  postImage: {
    width: '100%',
    borderRadius: 12 * scale,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8 * scale,
  },
  actionButton: {
    padding: 8 * scale,
    marginHorizontal: 16 * scale,
  },
  moreButton: {
    padding: 8 * scale,
  },
});