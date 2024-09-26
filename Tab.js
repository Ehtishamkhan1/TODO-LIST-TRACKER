import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './Screens/Home'
import Callender from './Screens/Callender';
import Profile from './Screens/Profile'
import { Ionicons } from '@expo/vector-icons';



const Tab = () => {

    const Tab = createBottomTabNavigator()

  return (
    <Tab.Navigator 
    screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Callender':
              iconName = 'calendar';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 15,}
      })}
     >
        <Tab.Screen name="Home" component={Home} options={{headerShown:false}}  />
        <Tab.Screen name="Callender" component={Callender} />
        <Tab.Screen name="Profile" component={Profile} />
        
    </Tab.Navigator>
  )
}

export default Tab