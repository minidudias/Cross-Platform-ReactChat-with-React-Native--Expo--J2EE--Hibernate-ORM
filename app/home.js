import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { LogBox } from 'react-native';
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useState, useEffect } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

const logoPath = require("../assets/images/logo.png");

export default function home() {
  const [getSearchText, setSearchText] = useState("");
  const [getChatArray, setChatArray] = useState([]);

  const [loaded, error] = useFonts({
    "Montserrat-Black": require("../assets/fonts/Montserrat-Black.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
  });



  useEffect(() => {
    async function fetchData() {
      let userJson = await AsyncStorage.getItem("user");
      let user = JSON.parse(userJson);
      LogBox.ignoreAllLogs();

      let response = await fetch(
        process.env.EXPO_PUBLIC_URL + "/ReactChat/LoadHomeData?id=" + user.id +
        "&searchText=" +
        getSearchText
      );

      if (response.ok) {
        let json = await response.json();

        if (json.success) {
          let chatArray = json.jsonChatArray;
          setChatArray(chatArray);
        } else {
          console.log("No success response from server");
        }
      } else {
        console.log("Fetch failed");
      }
    }
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, [getSearchText]);



  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);
  if (!loaded && !error) {
    return null;
  }



  return (
    <SafeAreaView style={styles.home}>
      <StatusBar style="light" backgroundColor="#273443" />
      <View style={styles.upperSection}>
        <View>
          <Image source={logoPath} style={styles.logo} />
        </View>

        <View style={styles.details}>
          <View style={styles.section}>
            <Text style={styles.text1}>  React Chat</Text>
            <Pressable style={styles.profile} onPress={() => {
              AsyncStorage.clear();
              router.replace("/");
            }}>
              <FontAwesome name="user-circle" color="white" size={25} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.view}>
        <View style={styles.view1}>
          <FontAwesome name="search" size={22} style={styles.icon1} />
          <TextInput
            style={styles.input1}
            autoCorrect={false}
            inputMode={"text"}
            maxLength={20}
            placeholder="Search for People to Chat"
            placeholderTextColor="#767c8c"
            onChangeText={(text) => {
              setSearchText(text);
            }}
          />
        </View>
      </View>

      <FlashList
        data={getChatArray}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              router.push({
                pathname: "/chat",
                params: item,
              });
            }}
          >
            <View style={styles.item}>
              <View
                style={
                  item.other_user_status == 1
                    ? styles.profileOnline
                    : styles.profileOffline
                }
              >
                {item.avatar_image_found ? (
                  <Image
                    style={styles.itemImg}
                    source={{
                      uri:
                        process.env.EXPO_PUBLIC_URL + "/ReactChat/AvatarImages/" +
                        item.other_user_mobile +
                        ".png",
                    }}
                  />
                ) : (
                  <Text style={styles.profileText}>
                    {item.other_user_avatar_letters}
                  </Text>
                )}
              </View>

              <View style={styles.itemMsg}>
                <Text style={styles.itemTxt1}>{item.other_user_name}</Text>
                <Text numberOfLines={1} style={styles.itemTxt2}>
                  {item.message}
                </Text>
              </View>
              <View style={styles.itemTime}>
                <Text style={styles.itemTxt3}>{item.dateTime}</Text>
                <View style={styles.itemCount}>
                  <Text style={styles.itemTxt4}>{item.unseenCount}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
        estimatedItemSize={200}
      />
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  home: {
    flex: 1,
    backgroundColor: "#273443"
  },

  view1: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#273443",
    borderRadius: 16,
  },

  icon1: {
    position: "absolute",
    start: 15,
    color: "#767c8c",
  },

  input1: {
    height: 46,
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#767c8c",
    borderRadius: 16,
    fontSize: 16,
    color: "#d4d6d8",
    paddingStart: 52,
    fontFamily: "Montserrat-Medium",
  },

  view: {
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    paddingTop: 0,
    backgroundColor: "#767c8c",
    width: "100%",
    flexDirection: "row",
  },

  upperSection: {
    backgroundColor: "#767c8c",
    width: "100%",
    flexDirection: "row",
    padding: 11,
  },

  logo: {
    height: 53,
    width: 53,
    borderRadius: 50,
  },

  section: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  profile: {
    marginLeft: "auto",
  },

  details: {
    flex: 1,
    justifyContent: "center",
  },

  text1: {
    fontFamily: "Montserrat-Medium",
    fontSize: 26,
    color: "white",
    fontWeight: "bold"
  },

  scrollView: {
    flex: 1,
  },

  homeText1: {
    fontSize: 32,
    color: "white",
    fontFamily: "times",
    fontWeight: "bold",
  },

  homeInput1: {
    height: 44,
    width: "90%",
    borderColor: "gray",
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 22,
    fontSize: 17,
    paddingLeft: 22,
    backgroundColor: "white",
  },

  homeView1: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 22,
  },

  homeInputIcon: {
    position: "absolute",
    end: 12,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#767c8c",
    borderBottomStartRadius: 100,
    backgroundColor: "#273443"
  },

  profileOnline: {
    justifyContent: "center",
    alignItems: "center",
    height: 65,
    width: 65,
    borderRadius: 50,
    backgroundColor: "#767c8c",
    borderWidth: 3,
    borderColor: "#59ce72",
  },

  profileOffline: {
    justifyContent: "center",
    alignItems: "center",
    height: 65,
    width: 65,
    borderRadius: 50,
    backgroundColor: "#767c8c",
    borderWidth: 3,
    borderColor: "red",
  },

  profileText: {
    fontFamily: "Montserrat-ExtraBold",
    fontSize: 22,
    color: "#d4d6d8",
    alignSelf: "center"
  },

  itemImg: {
    height: 57,
    width: 57,
    borderRadius: 50,
  },

  itemMsg: {
    alignItems: "flex-start",
    padding: 5,
    gap: 2,
    width: "50%",
  },

  itemTime: {
    marginTop: 10,
    alignItems: "flex-end",
    gap: 5,
    width: "30%",
  },

  itemTxt1: {
    fontSize: 18,
    color: "#d4d6d8",
    fontFamily: "Montserrat-Bold",
  },

  itemTxt2: {
    fontFamily: "Montserrat-Medium",
    fontSize: 13,
    color: "#d4d6d8",
  },

  itemTxt3: {
    fontFamily: "Montserrat-Medium",
    fontSize: 10,
    color: "#d4d6d8",
  },

  itemTxt4: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },

  itemCount: {
    height: 24,
    width: 24,
    backgroundColor: "#0f9d58",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
});
