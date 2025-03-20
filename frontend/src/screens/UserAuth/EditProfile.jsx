import React, { useState } from 'react';
import { Text, Platform ,View, TextInput,Modal, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const EditProfile = () => {
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
  const [resume, setResume] = useState('');
  const [languageProficiency, setLanguageProficiency] = useState('');
  const [achievements, setAchievements] = useState('');
  const [birthYear, setBirthYear] = useState("");
  const [date, setDate] = useState(new Date());
  const [gender, setGender] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === "ios"); 
    if (selectedDate) {
      setDate(selectedDate);
      setBirthYear(selectedDate.getFullYear().toString()); 
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
      resume,
      languageProficiency,
      achievements,
    });

    
    Alert.alert('Success', 'Profile updated successfully!');
  };

  return (
    <View style={styles.container}>
      
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EDIT PROFILE</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="search" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="ellipsis-v" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
  <View style={styles.avatarWrapper}>
    <Icon name="user" size={60} color="#333" />
    <TouchableOpacity style={styles.editIcon}>
      <Icon name="pencil" size={14} color="black" />
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
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Address"
            placeholderTextColor="#999"
            value={address}
            onChangeText={setAddress}
          />

          {/* Phone & PIN in a row */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Phone</Text>
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
              <Text style={styles.inputLabel}>Pin CODE</Text>
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
      <Text style={styles.inputLabel}>Birth Year</Text>

      {/* Touchable to Open Date Picker */}
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="YYYY"
          placeholderTextColor="#999"
          keyboardType="number-pad"
          value={birthYear}
          editable={false} // Prevents manual input
        />
      </TouchableOpacity>

      {/* Date Picker Modal */}
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
          maximumDate={new Date()} // Prevents selecting future dates
        />
      )}
    </View>

    <View style={styles.halfInput}>
      <Text style={styles.inputLabel}>Gender</Text>

      {/* Touchable to Open Picker */}
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
        <Text style={{ color: gender ? "#000" : "#999" }}>
          {gender || "Select Gender"}
        </Text>
      </TouchableOpacity>

      {/* Modal for Picker */}
      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => {
                setGender(itemValue);
                setShowPicker(false); // Close modal after selection
              }}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        </View>
      </Modal>
    </View>
          </View>

          {/* Bio */}
          <Text style={[styles.sectionTitle, styles.sectionDivider]}>About</Text>
          <Text style={styles.inputLabel}>Bio</Text>
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
          <Text style={styles.inputLabel}>Highest Qualification</Text>
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

          <Text style={styles.inputLabel}>Year of Graduation</Text>
          <TextInput
            style={styles.input}
            placeholder="Year"
            placeholderTextColor="#999"
            value={graduationYear}
            onChangeText={setGraduationYear}
          />

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
              {/* Note: Replace this with a Picker if you want a dropdown */}
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
          <Text style={styles.inputLabel}>Resume</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Resume Link or Details"
            placeholderTextColor="#999"
            value={resume}
            onChangeText={setResume}
          />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 15,
    height: 60,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 15,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#494949',
  },
  profileContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderWidth: 5,
    borderColor: 'green',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'green',
    width: 25,
    height: 25,
    borderRadius: 14.5,
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
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
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
    fontSize: 16,
    marginBottom: 5,
  },
  required: {
    color: 'red',
  },
  input: {
    backgroundColor: '#ddd',
    color: '#333',
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfile;