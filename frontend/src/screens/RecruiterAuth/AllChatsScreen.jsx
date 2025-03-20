import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChatHistory } from '../../store/slices/chatSlice';
import { useSocket } from '../../components/Helpers/SocketProvider';

export default function AllChatsScreen({ navigation }) {
    const [currentUser, setCurrentUser] = useState(null);
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { messages } = useSelector((state) => state.chat);
 // Assuming auth slice stores user data

  useEffect(() => {
    if (currentUser?._id) {
      // Fetch initial chat data (you may need a custom endpoint or logic to list all chats)
      dispatch(fetchChatHistory({ senderId: currentUser._id, receiverId: 'all' })); // Placeholder, adjust endpoint
    }
  }, [currentUser?._id, dispatch]);

  useEffect(() => {
    // Fetch user data from Async Storage
    const fetchUser = async () => {
      const userData = await getUserData();
      setCurrentUser(userData);
      if (userData?._id) {
        // Fetch chat history with the current user's ID
        dispatch(fetchChatHistory({ senderId: userData._id, receiverId: 'all' })); // Placeholder, adjust endpoint
      }
    };
    fetchUser();
  }, [dispatch]);

  const renderChatItem = ({ item }) => {
    const otherUser = item.sender === currentUser._id ? item.receiverData : item.senderData; // Assuming message includes user data
    const lastMessage = item.message || 'No messages yet';
    const hasValidProfileImage = otherUser?.profileImage && otherUser?.profileImage.startsWith('https');

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatScreen', { user: otherUser })}
      >
        {hasValidProfileImage ? (
          <Image source={{ uri: otherUser.profileImage }} style={styles.chatImage} />
        ) : (
          <Icon name="person-circle-outline" size={40} color="#888" />
        )}
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{otherUser?.name || 'Unknown User'}</Text>
          <Text style={styles.lastMessage}>{lastMessage}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages} // Adjust data source based on your backend's chat list endpoint
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.emptyText}>No chats available</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  chatItem: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  chatImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  chatInfo: { justifyContent: 'center' },
  chatName: { fontSize: 16, fontWeight: 'bold' },
  lastMessage: { fontSize: 14, color: '#666' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },
});