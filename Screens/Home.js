import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Button,
  TextInput,
  Alert,
  ToastAndroid,
  RefreshControl,
} from "react-native"; // Importing React Native components
import React, { useEffect, useState, useCallback } from "react"; // Importing hooks from React
import Ionicons from "@expo/vector-icons/Ionicons"; // Importing Ionicons for icons
import Modal from "react-native-modal"; // Importing Modal for pop-up
import { firebase } from "../Config"; // Importing Firebase
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";

const Home = () => {
  const [todos, settodos] = useState([]); // State to hold todo items
  const [showModal, setShowModal] = useState(false); // State to handle modal visibility
  const [todo, settodo] = useState(""); // State to store a new todo input
  const [Category, setCategory] = useState(""); // State to store the selected category
  const [Pending, setPending] = useState([]); // State to store the number of pending todos
  const [Completed, setCompleted] = useState([]); // State to store the number of completed todos
  const [refreshing, setRefreshing] = useState(false);
  const [datetimeopen, setdatetimeopen] = useState(false); // State to handle date picker visibility

  // Sample todo suggestions
  const todoSuggestions = [
    { id: 1, todo: "Drink water" },
    { id: 2, todo: "Take medication" },
    { id: 3, todo: "Go for a walk" },
    { id: 4, todo: "Submit Assignment" },
    { id: 5, todo: "Read a book" },
    { id: 6, todo: "Work on project" },
  ];

  // Function to toggle the modal visibility
  const togglemodal = () => {
    setShowModal(!showModal);
  };

  const handlereferesh = async () => {
    setRefreshing(true);
    await fetchtodo();
    setRefreshing(false);
  };

  const handleConfirm = (date) => {
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",

      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    const formateddate = date.toLocaleDateString("en-US", options);

    if (formateddate) {
      console.log(formateddate);
      setdatetimeopen(false);
      addTodo(formateddate);
      togglemodal();
    }
  };

  const hideDatePicker = () => {
    console.log("closed");
    setdatetimeopen(false);
  };

  // Function to add a new todo to the Firebase Firestore
  const addTodo = async (formateddate) => {
    try {
      // Preparing the todo data
      if (!todo) {
        Alert.alert("Please enter a todo");
        return;
      }
      if (!Category) {
        Alert.alert("PLease Select a Category");
        return;
      }

      const tododata = {
        todo: todo,
        category: Category,
        Status: "Pending",
        date: formateddate,
      };

      // Fetching the user ID from Firebase Authentication
      const userid = await firebase.auth().currentUser.uid;

      // Adding todo to Firestore under the current user
      await firebase
        .firestore()
        .collection("User")
        .doc(userid)
        .collection("Todos")
        .add(tododata);

      // Closing the modal after adding the todo
      togglemodal();

      setCategory("");
      settodo("");
      // Showing a toast message with black color
      ToastAndroid.show("Todo Added", ToastAndroid.SHORT);
    } catch (error) {
      console.log(error); // Log any error that occurs
    }
  };

  // Fetch todos when component mounts or when 'todo' changes
  const fetchtodo = async () => {
    try {
      // Fetching the user ID from Firebase Authentication
      const userid = await firebase.auth().currentUser.uid;

      // Fetching todos from Firestore under the current user
      const Snapshot = await firebase
        .firestore()
        .collection("User")
        .doc(userid)
        .collection("Todos")
        .get();

      // Mapping and storing todos in state
      const todosdata = Snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      settodos(todosdata);
      const pendingtodos = todosdata.filter(
        (todo) => todo.Status === "Pending"
      );
      setPending(pendingtodos);

      const completedtodos = todosdata.filter(
        (todo) => todo.Status === "Completed"
      );

      setCompleted(completedtodos);
    } catch (error) {
      console.log(error); // Log any error that occurs
    }
  };

  useEffect(() => {
    fetchtodo(); // Call the fetch function
  }, [todo]); // Dependencies: 'todo' state

  const OnLongPress = useCallback(
    (id) => {
      Alert.alert(
        "Todo Options",
        "What would you like to do?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "Completed",
            onPress: () => completeTodo(id),
          },
          {
            text: "Delete",
            onPress: () => deleteTodo(id),
          },
        ],
        { cancelable: false }
      );
    },
    [completeTodo, deleteTodo]
  );

  const completeTodo = useCallback(
    async (id) => {
      try {
        const uid = await firebase.auth().currentUser.uid;
        await firebase
          .firestore()
          .collection("User")
          .doc(uid)
          .collection("Todos")
          .doc(id)
          .update({ Status: "Completed" });

        ToastAndroid.show("Todo Completed", ToastAndroid.SHORT);
        settodos((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, Status: "Completed" } : item
          )
        );
        setCompleted(todos.filter((todo) => todo.Status === "Completed"));
        settodos((prev) => prev.filter((todo) => todo.Status !== "Completed"));
      } catch (e) {
        console.log(e);
      }
    },
    [todos]
  );

  const deleteTodo = useCallback(async (id) => {
    try {
      const uid = await firebase.auth().currentUser.uid;
      await firebase
        .firestore()
        .collection("User")
        .doc(uid)
        .collection("Todos")
        .doc(id)
        .delete();

      settodos((prev) => prev.filter((todo) => todo.id !== id));
      ToastAndroid.show("Todo Deleted", ToastAndroid.SHORT);
    } catch (e) {
      console.log(e);
    }
  }, []);

  return (
    <SafeAreaView style={{ marginTop: 30 }}>
      <View
        style={{
          flexDirection: "row",
          marginVertical: 10,
          marginHorizontal: 10,
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Button to filter All todos */}
        <TouchableOpacity
          style={{
            backgroundColor: "#7CB9E8",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 15,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>All</Text>
        </TouchableOpacity>

        {/* Button to filter Work todos */}
        <TouchableOpacity
          style={{
            backgroundColor: "#7CB9E8",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 15,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Work</Text>
        </TouchableOpacity>

        {/* Button to filter Personal todos */}
        <TouchableOpacity
          style={{
            backgroundColor: "#7CB9E8",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 15,
            marginRight: "auto",
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Personal</Text>
        </TouchableOpacity>

        {/* Button to open the Add Todo modal */}
        <TouchableOpacity onPress={togglemodal}>
          <Ionicons name="add-circle-outline" size={35} color="#007fff" />
        </TouchableOpacity>
      </View>

      {/* List of Todos */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handlereferesh}
            tintColor="blue"
            title="Refereshing..."
            titleColor="blue"
          />
        }
      >
        <View style={{ padding: 20 }}>
          {todos?.length > 0 ? (
            <View>
              {Pending.length > 0 && (
                <View>
                  {todos.map((todoItem) => (
                    <TouchableOpacity
                      onLongPress={() => OnLongPress(todoItem.id)}
                      key={todoItem.id}
                      style={{
                        backgroundColor: "#e0e0e0",
                        padding: 10,
                        borderRadius: 10,
                        marginBottom: 10,
                        marginVertical: 10,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Entypo name="circle" size={24} color="black" />
                        <Text style={{ flex: 1 }}>{todoItem.todo}</Text>
                        <Feather name="flag" size={24} color="black" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {Completed.length > 0 && (
                <View>
                  <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                    Completed
                  </Text>
                  {Completed.map((todoItem) => (
                    <View key={todoItem.id} style={{ marginVertical: 10 }}>
                      <Text style={{ fontSize: 16 }}>{todoItem.todo}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 120,
              }}
            >
              {/* Image displayed when there are no todos */}
              <Image
                style={{ width: 200, height: 200 }}
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/128/2387/2387679.png",
                }}
                resizeMode="contain"
              />
              <Text style={{ color: "gray", fontSize: 18, fontWeight: "bold" }}>
                No Todos for Today! Add tasks
              </Text>
              <TouchableOpacity style={{ marginTop: 20 }} onPress={togglemodal}>
                <Ionicons name="add-circle-outline" size={50} color="#007fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal for adding new todos */}
      <Modal
        isVisible={showModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropColor="black"
        backdropOpacity={0.7}
        swipeDirection="down"
        onBackdropPress={togglemodal}
        onSwipeComplete={togglemodal}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View
          style={{
            width: "100%",
            height: 400,
            backgroundColor: "white",
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              alignSelf: "center",
              marginBottom: 10,
            }}
          >
            Add Todo
          </Text>

          {/* Input for new todo */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TextInput
              style={{
                padding: 10,
                borderRadius: 10,
                borderColor: "#E0E0E0",
                width: "90%",
                borderWidth: 1,
              }}
              placeholder="Add Todo"
              value={todo}
              onChangeText={(text) => settodo(text)}
            />
            <TouchableOpacity onPress={() => setdatetimeopen(true)}>
              <Ionicons name="send" size={28} color="#007fff" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 16, marginTop: 10 }}>Choose Category</Text>

          {/* Buttons to choose the category */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: Category === "Work" ? "black" : "white",
                borderWidth: 1,
                padding: 10,
                borderRadius: 10,
              }}
              onPress={() => setCategory("Work")}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: Category === "Work" ? "white" : "black",
                }}
              >
                Work
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: Category === "Personal" ? "black" : "white",
                borderWidth: 1,
                padding: 10,
                borderRadius: 10,
              }}
              onPress={() => setCategory("Personal")}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: Category === "Personal" ? "white" : "black",
                }}
              >
                Personal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: Category === "Wishlist" ? "black" : "white",
                borderWidth: 1,
                padding: 10,
                borderRadius: 10,
              }}
              onPress={() => setCategory("Wishlist")}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: Category === "Wishlist" ? "white" : "black",
                }}
              >
                Wishlist
              </Text>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={datetimeopen}
              mode="datetime"
              minimumDate={new Date()}
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
          </View>

          <Text style={{ fontSize: 16, marginTop: 10 }}>Some Suggestions</Text>

          {/* Display todo suggestions */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 5,
              marginVertical: 10,
            }}
          >
            {todoSuggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: "#f0f8ff",
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                }}
                onPress={() => settodo(item.todo)}
              >
                <Text style={{ fontSize: 14 }}>{item.todo}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Home;
