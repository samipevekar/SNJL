import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { useSocket } from '../components/Helpers/SocketProvider';
import {
  sendMessage,
  sendInvite,
  acceptInvite,
  markMessageAsSeen,
  fetchChatHistory,
  addMessage,
  updateMessageStatus,
  setTypingStatus,
  clearChat,
} from '../store/slices/chatSlice';
import { getUserData } from '../storage/userData';
import { format } from 'date-fns';

export default function ChatScreen({ route, navigation }) {
  const user = route.params?.user; // Receiver user data
  const dispatch = useDispatch();
  const { socket, socketReady, setUser } = useSocket();
  const { messages, loading, error, inviteStatus, typingStatus, pagination } = useSelector(
    (state) => state.chat
  );
  const onlineStatus = useSelector((state) => state.onlineStatus.statuses[user?._id] || 'offline');
  console.log(`Online status for user ${user?._id}: ${onlineStatus}`);
  console.log("messages", messages);
  const [currentUser, setCurrentUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const theme = useSelector((state) => state.theme.mode);
  const flatListRef = useRef(null);
  const [page, setPage] = useState(1);

  const hasValidProfileImage = user?.profileImage && user?.profileImage.startsWith('https');
  const isReceiverRecruiter = user?.type === 'Recruiter';

  // Fetch current user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserData();
        console.log('Fetched currentUser:', userData);
        setCurrentUser(userData);
        setUser(userData); // Emit userActive when navigating to ChatScreen
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUser();

    return () => {
      console.log('Clearing chat on unmount');
      dispatch(clearChat());
    };
  }, [dispatch, setUser]);

  // Fetch chat history on initial load (page 1)
  useEffect(() => {
    if (currentUser?._id && user?._id) {
      console.log('Fetching initial chat history for page 1');
      dispatch(fetchChatHistory({ senderId: currentUser._id, receiverId: user._id, page: 1 }))
        .unwrap()
        .then((result) => {
          console.log('Initial chat history fetched:', result);
        })
        .catch((err) => {
          console.error('Error fetching initial chat history:', err);
        });
    }
  }, [currentUser?._id, user?._id, dispatch]);

  // Fetch more messages when page changes (for pagination)
  useEffect(() => {
    if (page > 1 && currentUser?._id && user?._id) {
      console.log('Fetching chat history for page:', page);
      dispatch(fetchChatHistory({ senderId: currentUser._id, receiverId: user._id, page }))
        .unwrap()
        .then((result) => {
          console.log('Chat history fetched for page:', page, result);
        })
        .catch((err) => {
          console.error('Error fetching chat history for page:', page, err);
        });
    }
  }, [page, currentUser?._id, user?._id, dispatch]);

  // Set up Socket.IO listeners
  useEffect(() => {
    if (currentUser?._id && user?._id && socket && socketReady) {
      console.log('Setting up socket listeners for user:', user._id);

      socket.on('newMessage', (newMessage) => {
        console.log('Received newMessage:', newMessage);
        const normalizedMessage = {
          ...newMessage,
          sender: typeof newMessage.sender === 'string' ? { _id: newMessage.sender } : newMessage.sender,
          receiver: typeof newMessage.receiver === 'string' ? { _id: newMessage.receiver } : newMessage.receiver,
        };
        if (
          (normalizedMessage.sender._id === user._id && normalizedMessage.receiver._id === currentUser._id) ||
          (normalizedMessage.sender._id === currentUser._id && normalizedMessage.receiver._id === user._id)
        ) {
          // Check if the message already exists to avoid duplicates
          const messageExists = messages.some((msg) => msg._id === normalizedMessage._id);
          if (!messageExists) {
            dispatch(addMessage(normalizedMessage));
          }
          if (normalizedMessage.receiver._id === currentUser._id && normalizedMessage.status !== 'seen') {
            dispatch(markMessageAsSeen({ messageId: normalizedMessage._id }))
              .unwrap()
              .catch((err) => {
                console.error('Failed to mark message as seen:', err);
                Alert.alert('Error', 'Failed to mark message as seen: ' + err);
              });
          }
        }
      });

      socket.on('messageSeen', (data) => {
        console.log('Received messageSeen:', data);
        dispatch(updateMessageStatus({ messageId: data.messageId, status: 'seen' }));
      });

      socket.on('typing', (data) => {
        console.log('Received typing:', data);
        if (data.senderId === user._id) {
          dispatch(setTypingStatus(true));
          setTimeout(() => dispatch(setTypingStatus(false)), 3000);
        }
      });

      return () => {
        console.log('Cleaning up socket listeners');
        socket.off('newMessage');
        socket.off('messageSeen');
        socket.off('typing');
      };
    }
  }, [currentUser?._id, user?._id, socket, socketReady, dispatch, messages]);

  // Handle sending a message
  const handleSendMessage = useCallback(() => {
    console.log('Send button pressed, messageText:', messageText);
    setMessageText('');
    if (!messageText.trim()) {
      console.log('Message is empty, not sending');
      return;
    }

    if (!currentUser?._id || !user?._id) {
      console.log('Missing user data, cannot send message:', { currentUser, user });
      return;
    }

    const messageData = {
      senderId: currentUser._id,
      senderType: currentUser.type || 'User',
      receiverId: user._id,
      receiverType: user.type || 'User',
      message: messageText,
    };

    console.log('Dispatching sendMessage:', messageData);
    dispatch(sendMessage(messageData))
      .unwrap()
      .then((result) => {
        console.log('Send message success:', result);
        // Do not add the message here; wait for the server to emit 'newMessage'
        
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      })
      .catch((err) => {
        console.error('Send message error:', err);
        if (err === "Recruiter has not accepted the invite yet") {
          Alert.alert(
            "Invitation Required",
            "You need to send an invitation to the recruiter before chatting.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Send Invite", onPress: handleSendInvite },
            ]
          );
        } else {
          Alert.alert("Error", err || "Failed to send message");
        }
      });
  }, [messageText, currentUser, user, dispatch]);

  // Handle sending an invitation
  const handleSendInvite = () => {
    console.log('Sending invite to:', user._id);
    dispatch(
      sendInvite({
        receiverId: user._id,
        receiverType: user.type || 'Recruiter',
      })
    )
      .unwrap()
      .then((result) => {
        console.log('Send invite success:', result);
        Alert.alert("Success", "Invitation sent to the recruiter!");
      })
      .catch((err) => {
        console.error('Send invite error:', err);
        Alert.alert("Error", err || "Failed to send invitation");
      });
  };

  // Handle accepting an invitation
  const handleAcceptInvite = () => {
    if (inviteStatus?.invitationId) {
      console.log('Accepting invite:', inviteStatus.invitationId);
      dispatch(acceptInvite({ invitationId: inviteStatus.invitationId }))
        .unwrap()
        .then((result) => {
          console.log('Accept invite success:', result);
          Alert.alert("Success", "Invitation accepted!");
        })
        .catch((err) => {
          console.error('Accept invite error:', err);
          Alert.alert("Error", err || "Failed to accept invitation");
        });
    } else {
      console.log('No invitationId found in inviteStatus:', inviteStatus);
    }
  };

  // Handle typing indicator (debounced for optimization)
  const handleTyping = useCallback(
    debounce(() => {
      if (isTyping && currentUser?._id && user?._id && socket && socketReady) {
        console.log('Emitting typing event to:', user._id);
        socket.emit('typing', {
          senderId: currentUser._id,
          receiverId: user._id,
          receiverType: user.type || 'User',
        });
      }
    }, 100),
    [isTyping, currentUser?._id, user?._id, socket, socketReady]
  );

  // Debounce function for typing optimization
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Load more messages for pagination
  const loadMoreMessages = () => {
    if (pagination && page < pagination.totalPages) {
      console.log('Loading more messages, next page:', page + 1);
      setPage(page + 1);
    }
  };

  // Render each message with seen status, timestamp, and profile image
  const renderMessage = ({ item }) => {
    console.log("item", item);
    const isSender = item.sender._id === currentUser?._id;
    const hasValidSenderImage = currentUser?.profileImage && currentUser?.profileImage.startsWith('https');
    const hasValidReceiverImage = user?.profileImage && user?.profileImage.startsWith('https');
    const formattedTime = item.timestamp
      ? format(new Date(item.timestamp), 'h:mm a')
      : 'Unknown time';

    return (
      <View
        style={[
          styles.messageContainer,
          isSender ? styles.senderContainer : styles.receiverContainer,
        ]}
      >
        {!isSender && (
          <View style={styles.profileImageWrapper}>
            {hasValidReceiverImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.chatImage} />
            ) : (
              <Image source={require('../../images/AvatarLight.png')} style={styles.chatImage} />
            )}
          </View>
        )}
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
          <View style={styles.messageFooter}>
            <Text style={styles.timestampText}>{formattedTime}</Text>
            {isSender && item.status === 'seen' && (
              <Text style={styles.seenText}>Seen</Text>
            )}
          </View>
        </View>
        {isSender && (
          <View style={styles.profileImageWrapper}>
            {hasValidSenderImage ? (
              <Image source={{ uri: currentUser.profileImage }} style={styles.chatImage} />
            ) : (
              <Image source={require('../../images/AvatarLight.png')} style={styles.chatImage} />
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#000000' }]}>
      <Header />

      {/* User Details Section with Online/Offline Status */}
      <View style={[styles.userDetails, { backgroundColor: '#494949' }]}>
        {hasValidProfileImage ? (
          <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
        ) : (
          <Image source={require('../../images/AvatarLight.png')} style={styles.profileImage} />
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
          <Text style={[styles.statusText, { color: onlineStatus === 'online' ? '#34C759' : '#FF4444' }]}>
            {onlineStatus === 'online' ? 'Online' : 'Offline'}
          </Text>
          {typingStatus && <Text style={styles.typingText}>Typing...</Text>}
        </View>
      </View>

      {/* Chat Area */}
      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.chatArea}
          inverted
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loading && page > 1 ? (
              <View style={styles.loadingMoreContainer}>
                <Text style={styles.loadingText}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Input Area */}
      <View style={[styles.inputContainer, { backgroundColor: '#494949' }]}>
        {isReceiverRecruiter && inviteStatus === 'pending' ? (
          <TouchableOpacity style={styles.inviteButton} onPress={handleSendInvite}>
            <Text style={styles.inviteButtonText}>Send Invite to Chat</Text>
          </TouchableOpacity>
        ) : inviteStatus === 'accepted' || !isReceiverRecruiter ? (
          <>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#888888"
                value={messageText}
                onChangeText={(text) => {
                  console.log('TextInput changed:', text);
                  setMessageText(text);
                  setIsTyping(!!text);
                  handleTyping();
                }}
                onBlur={() => setIsTyping(false)}
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
        ) : null}
      </View>

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
  container: { flex: 1 },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10, borderWidth: 5, borderColor: '#34C759' },
  chatImage: { width: 30, height: 30, borderRadius: 20, marginRight: 10, borderWidth: 5, borderColor: '#34C759' },
  profileImageWrapper: { marginHorizontal: 5 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  userUsername: { fontSize: 14 },
  statusText: { fontSize: 12 },
  typingText: { fontSize: 12, color: '#34C759' },
  chatArea: { paddingHorizontal: 10, paddingBottom: 20, flexGrow: 1 },
  messageContainer: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 5 },
  senderContainer: { justifyContent: 'flex-end', flexDirection: 'row' },
  receiverContainer: { justifyContent: 'flex-start' },
  messageBubble: { padding: 10, borderRadius: 15, maxWidth: width * 0.7 },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 2,
  },
  timestampText: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.7,
    marginRight: 5,
  },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#E5E5EA' },
  inputWrapper: { flex: 1, position: 'relative' },
  input: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#FFFFFF', color: '#000000', paddingRight: 30, marginRight: 5 },
  sendButton: { backgroundColor: '#34C759', borderRadius: 25, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  stickerIcon: { position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -8 }], width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  inviteButton: { flex: 1, backgroundColor: '#34A853', padding: 10, borderRadius: 10, alignItems: 'center' },
  inviteButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  errorContainer: { padding: 10, backgroundColor: '#FFCDD2', borderRadius: 5, margin: 10 },
  errorText: { color: '#D32F2F', fontSize: 14 },
  seenText: { fontSize: 10, color: '#FFFFFF', textAlign: 'right' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingMoreContainer: { padding: 10, alignItems: 'center' },
  loadingText: { color: '#888', fontSize: 16 },
});