import { View, Text, KeyboardAvoidingView, TextInput, Dimensions, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { firebase } from "../Config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigation = useNavigation();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (!validateEmail(text)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (!validatePassword(text)) {
      setPasswordError("Password must be at least 6 characters long.");
    } else {
      setPasswordError("");
    }
  };

  const Loginn = async () => {
    if (emailError || passwordError) {
      Alert.alert("Validation Error", "Please correct the errors before submitting.");
      return;
    }

    setLoading(true);

    try {
      const credentials = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = credentials.user;
      if (user && user.emailVerified) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
        navigation.navigate("Tab");
        
      } else {
        Alert.alert("Login Error", "Please verify your email.");
      }
    } catch (error) {
      Alert.alert("Login Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}>
      <View style={{ marginTop: 100, alignItems: "center" }}>
        <Text style={{ fontSize: 24, color: "#007FFF", fontWeight: "600" }}>
          TODO-LIST-TRACKER
        </Text>
      </View>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: 'center', width: '100%' }}>
        <View style={{ marginTop: 90, alignItems: "center" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingVertical: 10,
              borderRadius: 20,
              marginTop: 20,
              paddingHorizontal: 10,
              backgroundColor: emailError ? "#fdd" : "lightgray", // Red background for error
              borderColor: emailError ? "red" : "transparent", // Red border for error
              borderWidth: emailError ? 1 : 0, // Red border for error
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
              onChangeText={handleEmailChange}
            />
          </View>
          {emailError ? <Text style={{ color: "red", marginBottom: 10 }}>{emailError}</Text> : null}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingVertical: 10,
              borderRadius: 20,
              marginTop: 40,
              paddingHorizontal: 10,
              backgroundColor: passwordError ? "#fdd" : "lightgray", // Red background for error
              borderColor: passwordError ? "red" : "transparent", // Red border for error
              borderWidth: passwordError ? 1 : 0, // Red border for error
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
              onChangeText={handlePasswordChange}
            />
          </View>
          {passwordError ? <Text style={{ color: "red", marginBottom: 20 }}>{passwordError}</Text> : null}
        </View>

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            width: width * 0.85,
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity>
            <Text style={{ color: "#007FFF" }}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#007FFF",
              paddingVertical: 12,
              paddingHorizontal: 50,
              borderRadius: 25,
              marginBottom: 20,
              width: width * 0.7,
              alignItems: "center",
            }}
            onPress={Loginn}
            disabled={loading}
          >
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: "white", fontSize: 18 }}>Login</Text>}
          </TouchableOpacity>

          <View style={{ flexDirection: "row" }}>
            <Text style={{ color: "gray" }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")} >
              <Text style={{ color: "#007FFF" }}>Create here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
