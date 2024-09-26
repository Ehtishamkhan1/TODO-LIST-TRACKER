import {
  View,
  Text,
  KeyboardAvoidingView,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import { firebase } from "../Config"; // Ensure firebase is configured properly

const { width } = Dimensions.get("window");

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    
    if (name && validateEmail(email) && validatePassword(password)) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [name, email, password]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleRegister = async () => {
    if (!isFormValid) {
      Alert.alert("Please fill out all fields correctly.");
      return;
    }

    setLoading(true);

    try {
      const credentials = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      await firebase.auth().currentUser.sendEmailVerification({
        handleCodeInApp: true,
        url: "https://assignment4-a3b57.firebaseapp.com",
      });
     

      await firebase
        .firestore()
        .collection("User")
        .doc(firebase.auth().currentUser.uid)
        .set({
          name,
          email,
        });
        
        alert(
          "Verification email sent. Please verify your email."
        );
      
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Registration Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}
    >
      <View style={{ marginTop: 100, alignItems: "center" }}>
        <Text style={{ fontSize: 24, color: "#007FFF", fontWeight: "600" }}>
          TODO-LIST-TRACKER
        </Text>
      </View>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, justifyContent: "center", width: "100%" }}
      >
        <View style={{ marginTop: 30, alignItems: "center" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingVertical: 10,
              borderRadius: 20,
              marginTop: 20,
              paddingHorizontal: 10,
              backgroundColor: "lightgray",
              width: width * 0.85,
            }}
          >
            <AntDesign name="user" size={24} color="gray" />
            <TextInput
              placeholder="Name"
              style={{
                marginVertical: 10,
                flex: 1,
                fontSize: 17,
              }}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (text.trim() === "") {
                  setNameError("Name is required.");
                } else {
                  setNameError("");
                }
              }}
            />
          </View>
          {nameError ? (
            <Text style={{ color: "red", marginBottom: 10 }}>{nameError}</Text>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingVertical: 10,
              borderRadius: 20,
              marginTop: 20,
              paddingHorizontal: 10,
              backgroundColor: "lightgray",
              width: width * 0.85,
            }}
          >
            <MaterialIcons name="email" size={24} color="gray" />
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              style={{
                marginVertical: 10,
                flex: 1,
                fontSize: 17,
              }}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (!validateEmail(text)) {
                  setEmailError("Please enter a valid email address.");
                } else {
                  setEmailError("");
                }
              }}
            />
          </View>
          {emailError ? (
            <Text style={{ color: "red", marginBottom: 10 }}>{emailError}</Text>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingVertical: 10,
              borderRadius: 20,
              marginTop: 20,
              paddingHorizontal: 10,
              backgroundColor: "lightgray",
              width: width * 0.85,
            }}
          >
            <FontAwesome name="lock" size={25} color="gray" />
            <TextInput
              placeholder="Password"
              secureTextEntry={true}
              style={{
                marginVertical: 10,
                flex: 1,
                fontSize: 17,
              }}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (!validatePassword(text)) {
                  setPasswordError(
                    "Password must be at least 6 characters long."
                  );
                } else {
                  setPasswordError("");
                }
              }}
            />
          </View>
          {passwordError ? (
            <Text style={{ color: "red", marginBottom: 20 }}>
              {passwordError}
            </Text>
          ) : null}
        </View>

        <View style={{ alignItems: "center", marginTop: 50 }}>
          <TouchableOpacity
            style={{
              backgroundColor: isFormValid ? "#007FFF" : "gray",
              paddingVertical: 12,
              paddingHorizontal: 50,
              borderRadius: 25,
              marginBottom: 20,
              width: width * 0.7,
              alignItems: "center",
            }}
            onPress={handleRegister}
            disabled={!isFormValid}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: "white", fontSize: 18 }}>Register</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: "row" }}>
            <Text style={{ color: "gray" }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={{ color: "#007FFF" }}>Login here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;
