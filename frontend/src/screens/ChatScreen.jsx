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
  Platform,
  PermissionsAndroid,
  Linking,
  ActivityIndicator, // Already imported
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

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
  const [selectedMedia, setSelectedMedia] = useState(null); // For media preview
  const [isMediaUploading, setIsMediaUploading] = useState(false); // New state for media upload loading
  const theme = useSelector((state) => state.theme.mode);
  const flatListRef = useRef(null);
  const [page, setPage] = useState(1);
  const [receiver, setReceiver] = useState(null); // Persist receiver data in state

  const hasValidProfileImage = receiver?.profileImage && receiver?.profileImage.startsWith('https');
  const isReceiverRecruiter = receiver?.type === 'Recruiter';

  // Function to save receiver data to AsyncStorage
  const saveReceiverToStorage = async (receiverData) => {
    if (!receiverData?._id) {
      console.error('Cannot save receiver to AsyncStorage: receiverData._id is missing');
      return;
    }
    try {
      const key = `chatReceiver_${receiverData._id}`;
      await AsyncStorage.setItem(key, JSON.stringify(receiverData));
      console.log(`Receiver data saved to AsyncStorage with key ${key}:`, receiverData);
    } catch (err) {
      console.error('Error saving receiver to AsyncStorage:', err);
    }
  };

  // Function to retrieve receiver data from AsyncStorage
  const getReceiverFromStorage = async (receiverId) => {
    if (!receiverId) {
      console.error('Cannot retrieve receiver from AsyncStorage: receiverId is missing');
      return null;
    }
    try {
      const key = `chatReceiver_${receiverId}`;
      const storedReceiver = await AsyncStorage.getItem(key);
      if (storedReceiver) {
        const parsedReceiver = JSON.parse(storedReceiver);
        console.log(`Receiver data retrieved from AsyncStorage with key ${key}:`, parsedReceiver);
        return parsedReceiver;
      }
      console.log(`No receiver data found in AsyncStorage for key ${key}`);
      return null;
    } catch (err) {
      console.error('Error retrieving receiver from AsyncStorage:', err);
      return null;
    }
  };

  // Persist receiver data and load from AsyncStorage if needed
  useEffect(() => {
    const initializeReceiver = async () => {
      let receiverId = user?._id;

      if (user) {
        setReceiver(user);
        await saveReceiverToStorage(user);
      } else {
        const params = route.params;
        receiverId = params?.user?._id || params?.receiverId;

        if (receiverId) {
          const storedReceiver = await getReceiverFromStorage(receiverId);
          if (storedReceiver) {
            setReceiver(storedReceiver);
          } else {
            Alert.alert('Error', 'Receiver data not found. Please try again.');
            navigation.goBack();
          }
        } else {
          Alert.alert('Error', 'Receiver ID not found. Please try again.');
          navigation.goBack();
        }
      }
    };

    initializeReceiver();
  }, [user, route.params, navigation]);

  // Fetch current user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserData();
        console.log('Fetched currentUser:', userData);
        setCurrentUser(userData);
        setUser(userData);
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
    if (currentUser?._id && receiver?._id) {
      console.log('Fetching initial chat history for page 1');
      dispatch(fetchChatHistory({ senderId: currentUser._id, receiverId: receiver._id, page: 1 }))
        .unwrap()
        .then((result) => {
          console.log('Initial chat history fetched:', result);
        })
        .catch((err) => {
          console.error('Error fetching initial chat history:', err);
        });
    }
  }, [currentUser?._id, receiver?._id, dispatch]);

  // Fetch more messages when page changes (for pagination)
  useEffect(() => {
    if (page > 1 && currentUser?._id && receiver?._id) {
      console.log('Fetching chat history for page:', page);
      dispatch(fetchChatHistory({ senderId: currentUser._id, receiverId: receiver._id, page }))
        .unwrap()
        .then((result) => {
          console.log('Chat history fetched for page:', page, result);
        })
        .catch((err) => {
          console.error('Error fetching chat history for page:', page, err);
        });
    }
  }, [page, currentUser?._id, receiver?._id, dispatch]);

  // Set up Socket.IO listeners
  useEffect(() => {
    if (currentUser?._id && receiver?._id && socket && socketReady) {
      console.log('Setting up socket listeners for user:', receiver._id);

      socket.on('newMessage', (newMessage) => {
        console.log('Received newMessage:', newMessage);
        const normalizedMessage = {
          ...newMessage,
          sender: typeof newMessage.sender === 'string' ? { _id: newMessage.sender } : newMessage.sender,
          receiver: typeof newMessage.receiver === 'string' ? { _id: newMessage.receiver } : newMessage.receiver,
        };
        if (
          (normalizedMessage.sender._id === receiver._id && normalizedMessage.receiver._id === currentUser._id) ||
          (normalizedMessage.sender._id === currentUser._id && normalizedMessage.receiver._id === receiver._id)
        ) {
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
        if (data.senderId === receiver._id) {
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
  }, [currentUser?._id, receiver?._id, socket, socketReady, dispatch, messages]);

  // Request permissions for camera and storage
  const requestMediaPermissions = async () => {
    if (Platform.OS !== 'android') {
      console.log('Not Android, skipping permission check');
      return true;
    }

    try {
      const permissions = [];
      if (Platform.Version >= 33) {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
        console.log('Android 13+, requesting READ_MEDIA_IMAGES');
      } else {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        console.log('Android 12 or below, requesting READ_EXTERNAL_STORAGE');
      }
      permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
      console.log('Requesting CAMERA permission');

      const cameraCheck = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      const storageCheck = Platform.Version >= 33
        ? await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES)
        : await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      console.log('Camera permission check:', cameraCheck);
      console.log('Storage permission check:', storageCheck);

      if (cameraCheck && storageCheck) {
        console.log('Permissions already granted');
        return true;
      }

      console.log('Requesting permissions:', permissions);
      const granted = await PermissionsAndroid.requestMultiple(permissions);
      console.log('Permission request result:', granted);

      await new Promise(resolve => setTimeout(resolve, 500));

      const cameraGranted = granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED;
      const storageGranted = Platform.Version >= 33
        ? granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED
        : granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED;

      console.log('Camera granted:', cameraGranted);
      console.log('Storage granted:', storageGranted);

      if (cameraGranted && storageGranted) {
        console.log('Media permissions granted');
        return true;
      } else {
        console.log('Media permissions denied');
        const shouldShowRationaleCamera = await PermissionsAndroid.shouldShowRequestPermissionRationale(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        const shouldShowRationaleStorage = Platform.Version >= 33
          ? await PermissionsAndroid.shouldShowRequestPermissionRationale(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES)
          : await PermissionsAndroid.shouldShowRequestPermissionRationale(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        console.log('Should show rationale (Camera):', shouldShowRationaleCamera);
        console.log('Should show rationale (Storage):', shouldShowRationaleStorage);

        if (!shouldShowRationaleCamera || !shouldShowRationaleStorage) {
          Alert.alert(
            'Permission Denied',
            'Camera and storage permissions are required to select media. Please enable them in your app settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert('Permission Denied', 'Camera and storage permissions are required to select media.');
        }
        return false;
      }
    } catch (err) {
      console.warn('Error requesting media permissions:', err);
      Alert.alert('Error', 'Failed to request permissions: ' + err.message);
      return false;
    }
  };

  // Handle media selection from gallery or camera
  const handleAddMedia = async (source) => {
    console.log('handleAddMedia called with source:', source);
    const hasPermission = await requestMediaPermissions();
    console.log('Has permission:', hasPermission);
    if (!hasPermission) return;

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    const callback = (response) => {
      console.log('Media picker response:', JSON.stringify(response, null, 2));
      if (response.didCancel) {
        console.log('User cancelled media picker');
      } else if (response.errorCode) {
        console.error('MediaPicker Error:', response.errorMessage);
        Alert.alert('Error', 'Failed to pick media: ' + response.errorMessage);
      } else {
        const asset = response.assets[0];
        console.log('Selected media asset:', asset);
        setSelectedMedia({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `media_${Date.now()}.jpg`,
        });
      }
    };

    if (source === 'gallery') {
      console.log('Launching image library');
      launchImageLibrary(options, callback);
    } else if (source === 'camera') {
      console.log('Launching camera');
      launchCamera(options, callback);
    }

    // dispatch(fetchChatHistory({ senderId: currentUser._id, receiverId: receiver._id, page }))
  };

  // Cancel the selected media
  const cancelMediaSelection = () => {
    setSelectedMedia(null);
    setIsMediaUploading(false); // Reset uploading state
  };

  // Handle sending a message (text, media, or both)
  const handleSendMessage = useCallback(() => {
    setMessageText('');
    console.log('Send button pressed, messageText:', messageText, 'selectedMedia:', selectedMedia);

    if (!currentUser?._id || !receiver?._id) {
      console.log('Missing user data, cannot send message:', { currentUser, receiver });
      Alert.alert('Error', 'User data is missing. Please try again.');
      return;
    }

    if (!selectedMedia && !messageText.trim()) {
      console.log('No message or media to send');
      Alert.alert('Error', 'Please enter a message or select media to send.');
      return;
    }

    // If media is selected, send as FormData
    if (selectedMedia) {
      setIsMediaUploading(true); // Start loading for media upload
      const formData = new FormData();
      formData.append('receiverId', receiver._id);
      formData.append('receiverType', receiver.type || 'User');
      formData.append('message', messageText.trim() || '');
      formData.append('media', {
        uri: selectedMedia.uri,
        type: selectedMedia.type,
        name: selectedMedia.name,
      });

      console.log('Sending media with formData:', formData);
      dispatch(sendMessage(formData))
        .unwrap()
        .then((result) => {
          console.log('Send media success:', result);
          setSelectedMedia(null);
          // setMessageText('');
          setIsMediaUploading(false); // Stop loading on success
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        })
        .catch((err) => {
          console.error('Send media error:', err);
          Alert.alert('Error', err || 'Failed to send media');
          setIsMediaUploading(false); // Stop loading on error
        });
    } else {
      // If no media, send as text message (message is required)
      const messageData = {
        receiverId: receiver._id,
        receiverType: receiver.type || 'User',
        message: messageText.trim(),
      };

      console.log('Dispatching sendMessage:', messageData);
      dispatch(sendMessage(messageData))
        .unwrap()
        .then((result) => {
          console.log('Send message success:', result);
          // setMessageText('');
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        })
        .catch((err) => {
          console.error('Send message error:', err);
          if (err === "Invitation required and must be accepted") {
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
    }
  }, [messageText, currentUser, receiver, dispatch, selectedMedia]);

  // Handle sending an invitation
  const handleSendInvite = () => {
    if (!receiver?._id) {
      console.log('Missing receiver ID, cannot send invite');
      Alert.alert('Error', 'Receiver data is missing. Please try again.');
      return;
    }

    console.log('Sending invite to:', receiver._id);
    dispatch(
      sendInvite({
        receiverId: receiver._id,
        receiverType: receiver.type || 'Recruiter',
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
      if (isTyping && currentUser?._id && receiver?._id && socket && socketReady) {
        console.log('Emitting typing event to:', receiver._id);
        socket.emit('typing', {
          senderId: currentUser._id,
          receiverId: receiver._id,
          receiverType: receiver.type || 'User',
        });
      }
    }, 100),
    [isTyping, currentUser?._id, receiver?._id, socket, socketReady]
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

  // Render each message with media, text, seen status, timestamp, and profile image
  const renderMessage = ({ item }) => {
    console.log("Rendering message:", item);
    const isSender = item.sender._id === currentUser?._id;
    const hasValidSenderImage = currentUser?.profileImage && currentUser?.profileImage.startsWith('https');
    const hasValidReceiverImage = receiver?.profileImage && receiver?.profileImage.startsWith('https');
    const formattedTime = item.timestamp
      ? format(new Date(item.timestamp), 'h:mm a')
      : 'Unknown time';

    const isMediaMessage = item.mediaType === 'image' && item.media;

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
              <Image source={{ uri: receiver.profileImage }} style={styles.chatImage} />
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
          {isMediaMessage && (
            <Image
              source={{ uri: item.media }}
              style={styles.chatMediaMessage}
              resizeMode="cover"
            />
          )}
          {item.message && (
            <Text style={{ color: '#FFFFFF', marginTop: isMediaMessage ? 5 : 0 }}>
              {item.message}
            </Text>
          )}
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
      {receiver ? (
        <View style={[styles.userDetails, { backgroundColor: '#494949' }]}>
          {hasValidProfileImage ? (
            <Image source={{ uri: receiver.profileImage }} style={styles.profileImage} />
          ) : (
            <Image source={require('../../images/AvatarLight.png')} style={styles.profileImage} />
          )}
          <View>
            <Text style={[styles.userName, { color: '#FFFFFF' }]}>
              {receiver?.name || 'Unknown User'}
            </Text>
            {receiver?.username && (
              <Text style={[styles.userUsername, { color: '#FFFFFF' }]}>
                @{receiver?.username || "provide username"}
              </Text>
            )}
            <Text style={[styles.statusText, { color: onlineStatus === 'online' ? '#34C759' : '#FF4444' }]}>
              {onlineStatus === 'online' ? 'Online' : 'Offline'}
            </Text>
            {typingStatus && <Text style={styles.typingText}>Typing...</Text>}
          </View>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading user data...</Text>
        </View>
      )}

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

      {/* Media Preview Area (if media is selected) */}
      {selectedMedia && (
        <View style={styles.mediaPreviewContainer}>
          <Image
            source={{ uri: selectedMedia.uri }}
            style={styles.mediaPreview}
            resizeMode="contain"
          />
          {isMediaUploading ? (
            <View style={styles.mediaLoadingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.mediaLoadingText}>Uploading...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.cancelMediaButton} onPress={cancelMediaSelection}>
              <Icon name="close-circle" size={24} color="#FF0000" />
            </TouchableOpacity>
          )}
        </View>
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
                editable={!isMediaUploading} // Disable input while uploading media
              />
              <TouchableOpacity style={styles.stickerIcon}>
                <Image
                  source={require('../../images/sticker.png')}
                  style={{ width: 16, height: 16, backgroundColor: '#494949', borderRadius: 8 }}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.sendButton, isMediaUploading && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={isMediaUploading} // Disable send button while uploading
            >
              <Icon name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Select Media Source',
                  'Choose where to pick the media from:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Gallery', onPress: () => handleAddMedia('gallery') },
                    { text: 'Camera', onPress: () => handleAddMedia('camera') },
                  ]
                );
              }}
              disabled={isMediaUploading} // Disable media selection while uploading
            >
              <Icon name="add-circle" size={30} color={isMediaUploading ? '#888888' : '#FFFFFF'} />
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
  chatMediaMessage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
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
  seenText: { fontSize: 10, color: '#FFFFFF', textAlign: 'right' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#E5E5EA' },
  inputWrapper: { flex: 1, position: 'relative' },
  input: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#FFFFFF', color: '#000000', paddingRight: 30, marginRight: 5 },
  sendButton: { backgroundColor: '#34C759', borderRadius: 25, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  sendButtonDisabled: { backgroundColor: '#888888' }, // Style for disabled send button
  stickerIcon: { position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -8 }], width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  inviteButton: { flex: 1, backgroundColor: '#34A853', padding: 10, borderRadius: 10, alignItems: 'center' },
  inviteButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  errorContainer: { padding: 10, backgroundColor: '#FFCDD2', borderRadius: 5, margin: 10 },
  errorText: { color: '#D32F2F', fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingMoreContainer: { padding: 10, alignItems: 'center' },
  loadingText: { color: '#888', fontSize: 16 },
  mediaPreviewContainer: {
    position: 'relative',
    padding: 10,
    backgroundColor: '#494949',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  cancelMediaButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  mediaLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  mediaLoadingText: {
    color: '#FFFFFF',
    marginTop: 5,
    fontSize: 12,
  },
});