import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Picker } from "@react-native-picker/picker";
import { useDispatch, useSelector } from "react-redux";

import { createJob,resetJobState, selectJobStatus, selectJobError} from "../../store/slices/jobSlice";

import RecuriterFooter from "./RecuriterFooter";
import Header from "../../components/Header";

const PostJob = () => {
  const { control, handleSubmit, formState: { errors }, reset } = useForm();
  const dispatch = useDispatch();
  const jobStatus = useSelector(selectJobStatus);
  const jobError = useSelector(selectJobError);

  // Handle form submission
  const onSubmit = (data) => {
    // Prepare the skills array by splitting the comma-separated string
    const skillsArray = data.skills.split(",").map(skill => skill.trim()).filter(skill => skill);

    const jobData = {
      title: data.title,
      description: data.description,
      location: data.location,
      salary: Number(data.salary),
      company: data.company,
      jobType: data.jobType,
      experience: data.experience,
      skills: skillsArray,
    };

    // Dispatch the createJob thunk
    dispatch(createJob(jobData));
  };

  // Handle success or error feedback
  useEffect(() => {
    if (jobStatus === "succeeded") {
      Alert.alert("Success", "Job posted successfully!");
      reset(); // Reset the form
      dispatch(resetJobState()); // Reset the job state
    } else if (jobStatus === "failed" && jobError) {
      Alert.alert("Error", jobError);
      dispatch(resetJobState()); // Reset the job state
    }
  }, [jobStatus, jobError, dispatch, reset]);

  return (
    <View style={styles.container}>
      <Header></Header>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Post a Job</Text>

        {/* Title */}
        <Controller
          control={control}
          name="title"
          rules={{ required: "Job title is required" }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Job Title</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Enter job title"
                placeholderTextColor="#888"
              />
              {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
            </View>
          )}
        />

        {/* Description */}
        <Controller
          control={control}
          name="description"
          rules={{ required: "Job description is required" }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Enter job description"
                placeholderTextColor="#888"
                multiline
                numberOfLines={4}
              />
              {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
            </View>
          )}
        />

        {/* Location */}
        <Controller
          control={control}
          name="location"
          rules={{ required: "Location is required" }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={[styles.input, errors.location && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Enter job location"
                placeholderTextColor="#888"
              />
              {errors.location && <Text style={styles.errorText}>{errors.location.message}</Text>}
            </View>
          )}
        />

        {/* Salary */}
        <Controller
          control={control}
          name="salary"
          rules={{
            required: "Salary is required",
            pattern: {
              value: /^[0-9]+$/,
              message: "Salary must be a number",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Salary (Annual)</Text>
              <TextInput
                style={[styles.input, errors.salary && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Enter salary (e.g., 50000)"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
              {errors.salary && <Text style={styles.errorText}>{errors.salary.message}</Text>}
            </View>
          )}
        />

        {/* Company */}
        <Controller
          control={control}
          name="company"
          rules={{ required: "Company name is required" }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Company</Text>
              <TextInput
                style={[styles.input, errors.company && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Enter company name"
                placeholderTextColor="#888"
              />
              {errors.company && <Text style={styles.errorText}>{errors.company.message}</Text>}
            </View>
          )}
        />

        {/* Job Type */}
        <Controller
          control={control}
          name="jobType"
          rules={{ required: "Job type is required" }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Job Type</Text>
              <View style={[styles.pickerContainer, errors.jobType && styles.inputError]}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Job Type" value="" />
                  <Picker.Item label="Full-Time" value="Full-Time" />
                  <Picker.Item label="Part-Time" value="Part-Time" />
                  <Picker.Item label="Internship" value="Internship" />
                  <Picker.Item label="Remote" value="Remote" />
                  <Picker.Item label="Hybrid" value="Hybrid" />
                </Picker>
              </View>
              {errors.jobType && <Text style={styles.errorText}>{errors.jobType.message}</Text>}
            </View>
          )}
        />

        {/* Experience */}
        <Controller
          control={control}
          name="experience"
          rules={{ required: "Experience level is required" }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Experience Level</Text>
              <View style={[styles.pickerContainer, errors.experience && styles.inputError]}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Experience" value="" />
                  <Picker.Item label="Fresher" value="Fresher" />
                  <Picker.Item label="1-3 Years" value="1-3 Years" />
                  <Picker.Item label="3-5 Years" value="3-5 Years" />
                  <Picker.Item label="5-10 Years" value="5-10 Years" />
                </Picker>
              </View>
              {errors.experience && <Text style={styles.errorText}>{errors.experience.message}</Text>}
            </View>
          )}
        />

        {/* Skills */}
        <Controller
          control={control}
          name="skills"
          rules={{ required: "Skills are required" }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Skills (comma-separated)</Text>
              <TextInput
                style={[styles.input, errors.skills && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="e.g., JavaScript, React, Node.js"
                placeholderTextColor="#888"
              />
              {errors.skills && <Text style={styles.errorText}>{errors.skills.message}</Text>}
            </View>
          )}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, jobStatus === "loading" && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={jobStatus === "loading"}
        >
          <Text style={styles.submitButtonText}>
            {jobStatus === "loading" ? "Posting..." : "Post Job"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <RecuriterFooter></RecuriterFooter>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#FFF",
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  picker: {
    height: 50,
    color: "#333",
  },
  inputError: {
    borderColor: "#FF0000",
  },
  errorText: {
    color: "#FF0000",
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: "#34C759",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PostJob;