
import React, { useState, useRef, useEffect } from "react";
import {
  Text, Platform, View, TextInput, Modal, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Alert, Image, PermissionsAndroid,  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from "@react-native-picker/picker";
import Header from "../../components/Header";
import DateTimePicker from "@react-native-community/datetimepicker";
import { launchImageLibrary } from 'react-native-image-picker';
import Footer from '../../components/Footer';
 // Updated import

const EditProfile = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const inputAnim = useRef(new Animated.Value(0)).current;


  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [bio, setBio] = useState('');
  const [qualification, setQualification] = useState('');
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [workExperience, setWorkExperience] = useState('');
  const [skill, setSkill] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [resume, setResume] = useState(null);
  const [languageProficiency, setLanguageProficiency] = useState('');
  const [achievements, setAchievements] = useState('');
  const [birthYear, setBirthYear] = useState("");
  const [date, setDate] = useState(new Date());
  const [graduationDate, setGraduationDate] = useState(new Date());
  const [gender, setGender] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showGraduationPicker, setShowGraduationPicker] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // State for profile image

  const toggleSearch = () => {
      setSearchVisible(!searchVisible);
      Animated.timing(inputAnim, {
        toValue: searchVisible ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };
    
  const handleFilePick = async () => {
    try {
      // Request storage permission (optional, only for Android)
      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        if (!hasPermission) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'This app needs access to your storage to upload a resume.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission Denied', 'Storage permission is required to upload a resume.');
            return;
          }
        }
      }
  
      // Open document picker to select a resume
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,    // Allow PDF files
          DocumentPicker.types.doc,    // Allow DOC files
          DocumentPicker.types.docx,   // Allow DOCX files
        ],
      });
  
      // Check if a file was selected
      if (result && result.length > 0) {
        const selectedFile = result[0];
        console.log('Selected resume:', selectedFile);
  
        // Update the resume state with the selected file
        setResume({
          uri: selectedFile.uri,
          type: selectedFile.type,
          name: selectedFile.name,
          size: selectedFile.size,
        });
  
        Alert.alert('Success', 'Resume selected successfully!');
      }
    } catch (err) {
      // Handle cancellation or errors
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the document picker');
      } else {
        console.error('DocumentPicker Error:', err);
        Alert.alert('Error', 'Failed to pick resume file. Please try again.');
      }
    }
  };


  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'This app needs access to your storage to select a profile picture.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Storage permission granted');
        return true;
      } else {
        console.log('Storage permission denied');
        Alert.alert('Permission Denied', 'Storage permission is required to select a profile picture.');
        return false;
      }
    } catch (err) {
      console.warn('Error requesting storage permission:', err);
      return false;
    }
  };

  const handleImagePick = async () => {
    
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    const options = {
      mediaType: 'photo',
      quality: 1,
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode, response.errorMessage);
        Alert.alert('Error', `Failed to pick image: ${response.errorMessage}`);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        console.log('Selected image URI:', uri);
        setProfileImage(uri);
        Alert.alert('Success', 'Profile picture selected!');
      }
    });
  };

  const onChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
      setBirthYear(selectedDate.getFullYear().toString());
    }
  };

  const onGraduationChange = (event, selectedDate) => {
    setShowGraduationPicker(Platform.OS === "ios");
    if (selectedDate) {
      setGraduationDate(selectedDate);
      setGraduationYear(selectedDate.getFullYear().toString());
    }
  };

  const handleSave = () => {
    if (!firstName || !lastName || !username || !email || !skill) {
      Alert.alert(
        'Error',
        'Please fill in all required fields (First Name, Last Name, Username, Email, Skill).'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    console.log({
      firstName,
      lastName,
      username,
      email,
      address,
      phone,
      pin,
      birthYear,
      gender,
      bio,
      qualification,
      college,
      graduationYear,
      currentCompany,
      jobTitle,
      workExperience,
      skill,
      portfolioLink,
      resume: resume ? resume.name : null,
      languageProficiency,
      achievements,
      profileImage,
    });

    Alert.alert('Success', 'Profile updated successfully!');
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      {/* Header */}

      <Header searchVisible={searchVisible} inputAnim={inputAnim} toggleSearch={toggleSearch} />     

      <ScrollView style={styles.scrollContainer}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatarImage}
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              />
            ) : (
              <Icon name="user" size={40} color="#333" />
            )}
            <TouchableOpacity
              style={styles.editIcon}
              onPress={handleImagePick}
            >
              <Icon name="pencil" size={10} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Personal Info.</Text>

          {/* First Name */}
          <Text style={styles.inputLabel}>
            First Name<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter First Name"
            placeholderTextColor="#999"
            value={firstName}
            onChangeText={setFirstName}
          />

          {/* Last Name */}
          <Text style={styles.inputLabel}>
            Last Name<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Last Name"
            placeholderTextColor="#999"
            value={lastName}
            onChangeText={setLastName}
          />

          {/* Username */}
          <Text style={styles.inputLabel}>
            Username<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
          />

          {/* Email */}
          <Text style={styles.inputLabel}>
            Email<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Address */}
          <Text style={styles.inputLabel}>Address<Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Address"
            placeholderTextColor="#999"
            value={address}
            onChangeText={setAddress}
          />

          {/* Phone & Pin CODE in a row */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Phone<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Phone"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Pin CODE<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Enter PIN Code"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={pin}
                onChangeText={setPin}
              />
            </View>
          </View>

          {/* Birth Year & Gender in a row */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Birth Year<Text style={styles.required}>*</Text></Text>
              <TouchableOpacity onPress={() => setShowPicker(true)}>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={birthYear}
                  editable={false}
                />
              </TouchableOpacity>
              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Gender<Text style={styles.required}>*</Text></Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={gender}
                  onValueChange={(itemValue) => setGender(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Others" value="others" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Bio */}
          <Text style={[styles.sectionTitle, styles.sectionDivider]}>About</Text>
          <Text style={styles.inputLabel}>Bio<Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={bio}
            onChangeText={setBio}
          />

          {/* Education Section */}
          <Text style={[styles.sectionTitle, styles.sectionDivider]}>Education</Text>

          {/* Qualification */}
          <Text style={styles.inputLabel}>Highest Qualification<Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Qualification"
            placeholderTextColor="#999"
            value={qualification}
            onChangeText={setQualification}
          />

          {/* College */}
          <Text style={styles.inputLabel}>College/University</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter College/University"
            placeholderTextColor="#999"
            value={college}
            onChangeText={setCollege}
          />

          {/* Year of Graduation */}
          <Text style={styles.inputLabel}>Year of Graduation</Text>
          <TouchableOpacity onPress={() => setShowGraduationPicker(true)}>
            <TextInput
              style={styles.input}
              placeholder="YYYY"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={graduationYear}
              editable={false}
            />
          </TouchableOpacity>
          {showGraduationPicker && (
            <DateTimePicker
              value={graduationDate}
              mode="date"
              display="default"
              onChange={onGraduationChange}
              maximumDate={new Date()}
            />
          )}

          {/* Professional Details Section */}
          <Text style={[styles.sectionTitle, styles.sectionDivider]}>Professional Details</Text>

          {/* Current Company */}
          <Text style={styles.inputLabel}>Current Company</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Current Company"
            placeholderTextColor="#999"
            value={currentCompany}
            onChangeText={setCurrentCompany}
          />

          {/* Job Title & Work Experience in a row */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Job Title / Role</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Job Title"
                placeholderTextColor="#999"
                value={jobTitle}
                onChangeText={setJobTitle}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Work Experience (in years)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Years"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={workExperience}
                onChangeText={setWorkExperience}
              />
            </View>
          </View>

          {/* Skill */}
          <Text style={styles.inputLabel}>
            Skill<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Skills"
            placeholderTextColor="#999"
            value={skill}
            onChangeText={setSkill}
          />

          {/* Portfolio / Website Link */}
          <Text style={styles.inputLabel}>Portfolio / Website Link</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Portfolio Link"
            placeholderTextColor="#999"
            keyboardType="url"
            value={portfolioLink}
            onChangeText={setPortfolioLink}
          />

          {/* Additional Details Section */}
          <Text style={[styles.sectionTitle, styles.sectionDivider]}>Additional Details</Text>

          {/* Resume */}


          {/* Language Proficiency */}
          <Text style={styles.inputLabel}>Language Proficiency</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Languages"
            placeholderTextColor="#999"
            value={languageProficiency}
            onChangeText={setLanguageProficiency}
          />

          {/* Achievements / Awards */}
          <Text style={styles.inputLabel}>Achievement / Awards</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Achievements or Awards"
            placeholderTextColor="#999"
            value={achievements}
            onChangeText={setAchievements}
          />

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Footer toggleSearch={toggleSearch} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#494949',
  },
  profileContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 21,
    backgroundColor: '#fff',
  },
  avatarWrapper: {
    position: 'relative',
    width: 87,
    height: 88,
    borderWidth: 5,
    borderColor: 'green',
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'green',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  formContainer: {
    backgroundColor: '#494949',
    padding: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 50,
    width: '100%',
    marginTop: -20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    marginBottom: 12,
    marginTop: 10,
  },
  sectionDivider: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#666',
  },
  inputLabel: {
    color: '#ddd',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    marginBottom: 5,
  },
  required: {
    color: 'green',
  },
  input: {
    backgroundColor: '#ddd',
    color: '#333',
    padding: 8,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 10,
    fontFamily: 'Inter',
    width: '100%',
    height: 33,
  },
  inputText: { // New style for text inside TouchableOpacity
    color: '#999', // Matches placeholderTextColor of TextInput
    fontSize: 10,
    fontFamily: 'Inter',
  },
  pickerContainer: {
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    height: 33,
    justifyContent: 'center',
  },
  picker: {
    color: '#999',
    fontSize: 10,
    fontFamily: 'Inter',
    height: 33,
    width: '100%',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfInput: {
    width: '48%',
  },
  saveButton: {
    backgroundColor: '#d9d9d9',
    padding: 0,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 45,
    width: 58,
    height: 21,
  },
  saveButtonText: {
    color: 'green',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfile;