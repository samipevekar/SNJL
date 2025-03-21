import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllChats, clearChat } from '../store/slices/chatSlice';
import { getUserData } from '../storage/userData';
import { formatDistanceToNow } from 'date-fns';

export default function AllChatsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { chats, loading, error } = useSelector((state) => state.chat);
  const theme = useSelector((state) => state.theme.mode);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserData();
        console.log('Fetched currentUser:', userData);
        setCurrentUser(userData);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUser();

    return () => {
      console.log('Clearing chat on unmount');
      dispatch(clearChat());
    };
  }, [dispatch]);

  // Fetch all chats on component mount
  useEffect(() => {
    if (currentUser?._id) {
      console.log('Fetching all chats');
      dispatch(fetchAllChats())
        .unwrap()
        .then((result) => {
          console.log('All chats fetched:', result);
        })
        .catch((err) => {
          console.error('Error fetching all chats:', err);
        });
    }
  }, [currentUser?._id, dispatch]);

  // Handle navigation to ChatScreen
  const handleChatPress = (user) => {
    console.log('handleChatPress called with user:', user);
    console.log('Navigating to ChatScreen with user:', user);
    navigation.navigate('ChatScreen', { user });
  };

  // Handle navigation to start a new chat (e.g., to a contacts screen)
  const handleNewChat = () => {
    console.log('Navigating to start a new chat');
    // Replace 'ContactsScreen' with the actual screen name for starting a new chat
    navigation.navigate('ContactsScreen');
  };

  // Format timestamp to relative time (e.g., "5min", "1hr")
  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: false })
        .replace('about ', '')
        .replace(' minutes', 'min')
        .replace(' hours', 'hr')
        .replace(' days', 'd')
        .replace(' months', 'mo')
        .replace(' years', 'yr');
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown';
    }
  };

  // Render each chat item
  const renderChat = ({ item }) => {
    const { user, latestMessage, latestTimestamp } = item;
    const hasValidProfileImage = user?.profileImage && user?.profileImage.startsWith('https');

    return (
      <TouchableOpacity  
        style={[styles.chatContainer ,{backgroundColor:theme==='light'?"#AEAEAE":"#494949"}]}
        onPress={() => handleChatPress(user)}
      >
        <View style={styles.profileImageWrapper}>
          {hasValidProfileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <Image source={require('../../images/AvatarLight.png')} style={styles.profileImage} />
          )}
        </View>
        <View style={styles.chatDetails}>
          <Text style={[styles.userName, { color: theme === 'light' ? '#000' : '#FFF' }]}>
            {user?.name || 'Unknown User'}
          </Text>
          <Text
            style={[styles.latestMessage, { color: theme === 'light' ? '#555' : '#AAA' }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {latestMessage || 'No messages yet'}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: theme === 'light' ? '#888' : '#AAA' }]}>
          {formatTimestamp(latestTimestamp)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'light' ? '#FFF' : '#000' }]}>
      <Header />
      <Text style={[styles.title, { color: theme === 'light' ? '#000000' : '#FFFFFF' }]}>MESSENGER</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme === 'light' ? '#888' : '#AAA' }]}>
            Loading chats...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme === 'light' ? '#888' : '#AAA' }]}>
            No chats yet. Start a new conversation!
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item.user._id}
          contentContainerStyle={styles.chatList}
        />
      )}

      {/* Floating Action Button for New Chat */}
      <TouchableOpacity style={styles.fab} onPress={handleNewChat}>
        <Icon name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

// Responsive Styles
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 15,
    // textAlign: 'center',
    marginLeft :20
  },
  chatList: {
    paddingBottom: 20,
  },
  chatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    // borderBottomWidth: 5,
    marginTop:5
  },
  profileImageWrapper: {
    marginRight: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: '#34C759',
  },
  chatDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  latestMessage: {
    fontSize: 14,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#34C759',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});