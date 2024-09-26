import { View, Text, Button } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebase } from "../Config";

const Profile = () => {
  const logout = async () => {
    await firebase.auth().signOut();
    await AsyncStorage.removeItem("user");
  };

  return (
    <View>
      <Button title="logout" onPress={logout} />
    </View>
  );
};

export default Profile;
