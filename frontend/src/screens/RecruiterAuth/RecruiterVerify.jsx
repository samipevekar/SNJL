import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Arrow from "react-native-vector-icons/AntDesign";
import {
  registerRecruiterAsync,
  selectRecruiterRegisterStatus,
  selectRecruiterVerifyStatus,
  verifyRecruiterAsync,
} from "../../store/slices/recruiterAuthSlice";
import { CommonActions } from "@react-navigation/native";

const RecruiterVerify = ({ navigation, route }) => {
  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: { otp: ["", "", "", "", "", ""] },
  });
  const inputRefs = Array.from({ length: 6 }, () => useRef(null));
  const otpValues = watch("otp");

  const [timer, setTimer] = useState(30);
  const [showTimer, setShowTimer] = useState(false);
  const intervalRef = useRef(null); // ✅ Interval ko track karne ke liye ref

  const dispatch = useDispatch();

  const loading = useSelector(selectRecruiterVerifyStatus);
  const resendLoading = useSelector(selectRecruiterRegisterStatus);

  const onSubmit = async (data) => {
    try {
      const otpCode = data.otp.join("");
      const result = await dispatch(
        verifyRecruiterAsync({
          email: route.params.email,
          code: otpCode,
        })
      ).unwrap();

      if (result.success) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        );
      }
    } catch (error) {
      Alert.alert("Error", error);
    } finally {
      reset();
    }
  };

  const handleResendOtp = async () => {
    try {
      const result = await dispatch(
        registerRecruiterAsync({
          name: route.params.name,
          email: route.params.email,
          password: route.params.password,
        })
      ).unwrap();

      if (result.success) {
        Alert.alert("Email Verification", result.message);
      }
    } catch (error) {
      Alert.alert("Error sending code", error);
    }

    setShowTimer(true);
    setTimer(30); //  Reset timer to 30

    // clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // starting new interval
    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(intervalRef.current);
          setShowTimer(false); // Timer khatam hone par hide kar do
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  // ✅ Cleanup effect
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.verifyHeader}>
        <Text style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Arrow size={20} color={"black"} name="left"></Arrow>
        </Text>
        <Text style={styles.header}>Verify Recruiter</Text>
      </View>
      <Text style={styles.subHeader}>Enter OTP</Text>
      <Text style={styles.info}>A 6-digit OTP has been sent to</Text>
      <Text style={styles.phone}>{route.params.email}</Text>
      <View style={styles.otpContainer}>
        {otpValues.map((digit, index) => (
          <Controller
            key={index}
            control={control}
            name={`otp[${index}]`}
            render={({ field: { onChange, value } }) => (
              <TextInput
                ref={inputRefs[index]}
                style={styles.input}
                keyboardType="numeric"
                maxLength={1}
                value={value}
                onChangeText={(text) => {
                  if (text.length > 1) return;
                  onChange(text);
                  if (text && index < 5) {
                    inputRefs[index + 1].current.focus();
                  }
                }}
                onKeyPress={(e) => {
                  if (
                    e.nativeEvent.key === "Backspace" &&
                    index > 0 &&
                    value === ""
                  ) {
                    inputRefs[index - 1].current.focus();
                  }
                }}
              />
            )}
          />
        ))}
      </View>
      <TouchableOpacity
        style={[styles.verifyButton, loading == "loading" && { opacity: 0.5 }]}
        onPress={handleSubmit(onSubmit)}
      >
        <Text disabled={loading == "loading"} style={styles.verifyText}>
          {loading == "loading" ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>

      <Pressable style={styles.resend}>
        <Text
          style={[
            styles.resendBtn,
            timer > 0 && timer < 30 && { opacity: 0.4 },
          ]}
          disabled={(timer > 0 && timer < 30) || resendLoading == "loading"}
          onPress={handleResendOtp}
        >
          {resendLoading === "loading" ? "Sending OTP..." : "Resend OTP"}
        </Text>
        {showTimer && <Text style={{ color: "gray" }}>(00:{timer})</Text>}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  verifyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "absolute",
    top: 20,
  },
  backIcon: { position: "absolute", left: 20, fontSize: 25 },
  header: { fontSize: 28, fontWeight: "bold", textAlign: "center" },
  subHeader: { fontSize: 22, fontWeight: "bold", marginTop: "90%" },
  info: { fontSize: 14, color: "gray", marginTop: 5 },
  phone: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  otpContainer: { flexDirection: "row", gap: 10, marginTop: 20 },
  input: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
  },
  verifyButton: {
    backgroundColor: "#00c04b",
    padding: 12,
    borderRadius: 15,
    marginTop: 30,
    width: "95%",
    alignItems: "center",
  },
  verifyText: { color: "white", fontSize: 18, fontWeight: "bold" },
  resend: {
    marginTop: 15,
    flexDirection: "row",
    gap: 10,
  },
  resendBtn: {
    fontWeight: "900",
  },
});

export default RecruiterVerify;
