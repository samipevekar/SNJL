import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client'; // Import socket.io-client
import {
  sendMessage,
  sendInvite,
  fetchChatHistory,
  addMessage,
  clearChat,
} from '../store/slices/chatSlice';
import { getToken } from '../storage/AuthStorage';
import { getUserData } from '../storage/userData';

// Initialize socket connection (update URL to match your backend)
const socket = io('http://192.168.43.111:5000', {
  auth: async (cb) => {
    const token = await getToken();
    cb({ token });
  },
});

export default function ChatScreen({ route, navigation }) {
  const user = route.params?.user; // Receiver user data
  const dispatch = useDispatch();
  const { messages, loading, error, inviteStatus } = useSelector((state) => state.chat);
  const [currentUser, setCurrentUser] = useState(null); // Assuming you have an auth slice with current user data
  const theme = useSelector((state) => state.theme.mode);
 console.log("currentusera",currentUser)
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef(null);

  // Check if profileImage is valid and starts with https
  const hasValidProfileImage =
    user?.profileImage && user?.profileImage.startsWith('https');

  // Determine if the receiver is a recruiter
  const isReceiverRecruiter = user?.type === 'Recruiter';



  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserData();
      setCurrentUser(userData);
      
    };
    fetchUser();
  }, []);

  


  // Fetch chat history when the screen loads
  useEffect(() => {
    if (currentUser?._id && user?._id) {
      dispatch(fetchChatHistory({ senderId: currentUser._id, receiverId: user._id }));
    }

    // Clear chat state when leaving the screen
    return () => {
      dispatch(clearChat());
    };
  }, [currentUser?._id, user?._id, dispatch]);

  // Set up WebSocket listener for new messages
  useEffect(() => {
    socket.on('newMessage', (newMessage) => {
      if (
        newMessage.sender === user._id &&
        newMessage.receiver === currentUser._id
      ) {
        dispatch(addMessage(newMessage)); // Add received message to state
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [user?._id, currentUser?._id, dispatch]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    dispatch(
      sendMessage({
        senderId: currentUser._id,
        senderType: currentUser.type || 'User', // Assuming type is in auth state
        receiverId: user._id,
        receiverType: user.type || 'User',
        message: messageText,
      })
    ).then((result) => {
      if (result.type === sendMessage.fulfilled.type) {
        setMessageText(''); // Clear input after sending
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      } else if (result.payload === "Recruiter has not accepted the invite yet") {
        Alert.alert(
          "Invitation Required",
          "You need to send an invitation to the recruiter before chatting.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Send Invite",
              onPress: handleSendInvite,
            },
          ]
        );
      }
    });
  };

  // Handle sending an invitation
  const handleSendInvite = () => {
    dispatch(
      sendInvite({
        recruiterId: user._id,
        userId: currentUser._id,
      })
    ).then((result) => {
      if (result.type === sendInvite.fulfilled.type) {
        Alert.alert("Success", "Invitation sent to the recruiter!");
      } else {
        Alert.alert("Error", result.payload || "Failed to send invitation");
      }
    });
  };

  const renderMessage = ({ item }) => {
    const isSender = item.sender === currentUser._id;

    return (
      <View
        style={[
          styles.messageContainer,
          isSender ? styles.senderContainer : styles.receiverContainer,
        ]}
      >
        {!isSender && <View style={styles.messageIndicator} />}
        <View
          style={[
            styles.messageBubble,
            isSender
              ? { backgroundColor: '#34A853' }
              : { backgroundColor: '#494949' },
            { borderRadius: 10 },
          ]}
        >
          <Text style={{ color: '#FFFFFF' }}>{item.message}</Text>
        </View>
        {isSender && <View style={styles.messageIndicator} />}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#000000' }]}>
      {/* Header */}
      <Header />

      {/* User Details Section */}
      <View style={[styles.userDetails, { backgroundColor: '#494949' }]}>
        {hasValidProfileImage ? (
          <Image
            source={{ uri: user.profileImage }}
            style={styles.profileImage}
          />
        ) : (
          <Icon
            name="person-circle-outline"
            size={40}
            color="#FFFFFF"
            style={styles.avatarIcon}
          />
        )}
        <View>
          <Text style={[styles.userName, { color: '#FFFFFF' }]}>
            {user?.name || 'Unknown User'}
          </Text>
          {user?.username && (
            <Text style={[styles.userUsername, { color: '#FFFFFF' }]}>
              @{user?.username || "provide username"}
            </Text>
          )}
        </View>
      </View>

      {/* Chat Area */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id || item.id} // Use _id from backend
        contentContainerStyle={styles.chatArea}
        inverted // To start from the bottom
      />

      {/* Input Area */}
      <View style={[styles.inputContainer, { backgroundColor: '#494949' }]}>
        {isReceiverRecruiter && inviteStatus === 'pending' ? (
          <TouchableOpacity style={styles.inviteButton} onPress={handleSendInvite}>
            <Text style={styles.inviteButtonText}>Send Invite to Chat</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Chat box"
                placeholderTextColor="#888888"
                value={messageText}
                onChangeText={setMessageText}
              />
              <TouchableOpacity style={styles.stickerIcon}>
                <Image
                  source={require('../../images/sticker.png')}
                  style={{ width: 16, height: 16, backgroundColor: '#494949', borderRadius: 8 }}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Icon name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="add-circle" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Display Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// Responsive Styles
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  avatarIcon: {
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userUsername: {
    fontSize: 14,
  },
  chatArea: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  senderContainer: {
    justifyContent: 'flex-end',
  },
  receiverContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    maxWidth: width * 0.7,
  },
  messageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginHorizontal: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    color: '#000000',
    paddingRight: 30,
    marginRight: 5,
  },
  sendButton: {
    backgroundColor: '#34C759',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stickerIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -8 }],
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteButton: {
    flex: 1,
    backgroundColor: '#34A853',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#FFCDD2',
    borderRadius: 5,
    margin: 10,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
});