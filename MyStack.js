import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./Screens/Login";
import Register from "./Screens/Register";
import Tab from "./Tab";
import { firebase } from "./Config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyStack = () => {
  const [isloggedin, setIsLoggedIn] = useState(null);
  const Stack = createStackNavigator();

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const userFromStorage = await AsyncStorage.getItem("user");

        const userFromFirebase = firebase.auth().currentUser;

        if (userFromStorage && userFromFirebase) {
          const parsedUserFromStorage = JSON.parse(userFromStorage);

          if (parsedUserFromStorage.uid === userFromFirebase.uid) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking login status", error);
        setIsLoggedIn(false);
      }
    };

    checkLoggedIn();

    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      try {
        if (user) {
          await AsyncStorage.setItem("user", JSON.stringify(user));
          setIsLoggedIn(true);
        } else {
          await AsyncStorage.removeItem("user");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error syncing authentication state", error);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Stack.Navigator>
      {!isloggedin ? (
        <>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Tab"
          component={Tab}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default MyStack;
