import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from 'react-native';
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import { SplashScreen, useLocalSearchParams } from "expo-router";
import { useRef, useState, useEffect } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FlashList } from "@shopify/flash-list";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

export default function chat() {
  const item = useLocalSearchParams();

  const [getChatArray, setChatArray] = useState([]);
  const [getChatText, setChatText] = useState("");
  const chatListRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const [loaded, error] = useFonts({
    "Montserrat-Black": require("../assets/fonts/Montserrat-Black.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
  });
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);




  useEffect(() => {
    let interval;

    async function fetchChatArray() {
      let userJson = await AsyncStorage.getItem("user");
      let user = JSON.parse(userJson);
      LogBox.ignoreAllLogs();

      let response = await fetch(
        process.env.EXPO_PUBLIC_URL + "/ReactChat/LoadChat?loggedUserId=" +
        user.id +
        "&&otherUserId=" +
        item.other_user_id
      );

      if (response.ok) {
        let chatArray = await response.json();
        setChatArray(chatArray);

        if (isAtBottom) {
          await chatListRef.current?.scrollToEnd({ animated: true });
        }
      } else {
        console.log("error");
      }
    }

    fetchChatArray();

    interval = setInterval(() => {
      fetchChatArray();
    }, 2000);

    window.onpopstate = () => {
      clearInterval(interval);
    };

    return () => {
      clearInterval(interval);
      window.onpopstate = null;
    };
  }, [isAtBottom]);

  const handleScroll = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const paddingToBottom = 1;

    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      setIsAtBottom(true);
    } else {
      setIsAtBottom(false);
    }
  };

  if (!loaded && !error) {
    return null;
  }




  return (
    <SafeAreaView style={styles.chat}>
      <StatusBar style="light" backgroundColor="#273443" />
      <View style={styles.upperSection}>
        <View style={styles.upper1}>
          <View style={styles.profileOnline}>
            {item.avatar_image_found == "true" ? (
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
        </View>

        <View style={styles.upper2}>
          <Text style={styles.itemTxt1}>{item.other_user_name}</Text>
          <Text style={styles.itemTxt2}>
            {item.other_user_status == 1 ? "Online" : "Offline"}
          </Text>
        </View>
      </View>

      <FlashList
        ref={chatListRef}
        data={getChatArray}
        renderItem={({ item }) => (
          <View
            style={
              item.side == "right" ? styles.chatSent : styles.chatReceived
            }
          >
            <Text style={styles.chatMsg}>{item.message}</Text>
            <View style={styles.chatView1}>
              <Text style={styles.chatTime}>{item.dateTime}</Text>
              {item.side == "right" ? (
                <View style={styles.tick}>
                  {item.status == 2 ? (
                    <View>
                      <FontAwesome
                        name="check"
                        size={13}
                        style={styles.chatIconSent}
                      />
                    </View>
                  ) : (
                    <View>
                      <FontAwesome
                        name="check"
                        size={13}
                        style={styles.chatIconSent}
                      />
                      <FontAwesome
                        name="check"
                        size={13}
                        style={styles.chatIconSeen}
                      />
                    </View>
                  )}
                </View>
              ) : null}
            </View>
          </View>
        )}
        estimatedItemSize={200}
        onScroll={handleScroll}
      />

      <View style={styles.chatSend}>
        <TextInput
          style={styles.chatInput1}
          autoCorrect={false}
          placeholder={"Message"}
          placeholderTextColor="#767c8c"
          value={getChatText}
          onChangeText={(text) => {
            setChatText(text);
          }}
        />

        <Pressable
          style={styles.sendBtn}
          onPress={async () => {
            if (getChatText.length == 0) {
              console.log("empty message");
            } else {
              let userJson = await AsyncStorage.getItem("user");
              let user = JSON.parse(userJson);

              let response = await fetch(
                process.env.EXPO_PUBLIC_URL + "/ReactChat/SendChat?loggedUserId=" +
                user.id +
                "&&otherUserId=" +
                item.other_user_id +
                "&&message=" +
                getChatText
              );

              if (response.ok) {
                let json = await response.json();
                if (json.success) {
                  console.log("message sent");
                  setChatText("");
                  setIsAtBottom(true);
                } else {
                  console.log("error sending message");
                }
              } else {
                console.log("error connecting");
              }
            }
          }}
        >
          <FontAwesome name="send" size={20} color={"#59ce72"} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}




const styles = StyleSheet.create({
  chat: {
    flex: 1,
    backgroundColor: "#273443",
    rowGap: 10,
  },

  upperSection: {
    backgroundColor: "#767c8c",
    width: "100%",
    flexDirection: "row",
    paddingTop: 8,
    paddingBottom: 8,
  },

  upper1: {
    width: "30%",
    alignItems: "center",
    rowGap: 2,
  },

  upper2: {
    width: "70%",
    justifyContent: "center",
  },

  profileOnline: {
    justifyContent: "center",
    alignItems: "center",
    height: 65,
    width: 65,
    borderRadius: 50,
    backgroundColor: "#59ce72",
  },

  profileText: {
    fontFamily: "Montserrat-ExtraBold",
    fontSize: 22,
    color: "#0f9d58",
  },

  itemImg: {
    height: 65,
    width: 65,
    borderRadius: 50,
  },

  itemTxt1: {
    fontSize: 20,
    color: "white",
    fontFamily: "Montserrat-ExtraBold",
  },

  itemTxt2: {
    fontSize: 13,
    color: "white",
    fontFamily: "Montserrat-Regular",
  },

  chatSend: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 5,
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },

  chatInput1: {
    width: "86%",
    height: 48,
    borderWidth: 2,
    borderRadius: 50,
    fontSize: 15,
    fontFamily: "Montserrat-Regular",
    color: "black",
    paddingLeft: 15,
    paddingRight: 10,
    color: "#d4d6d8",
    borderColor: "#767c8c",
    backgroundColor: "#273443",
  },

  sendBtn: {
    backgroundColor: "#767c8c",
    height: 48,
    width: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },

  chatSent: {
    backgroundColor: "#0f9d58",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-end",
    marginRight: 10,
    marginTop: 5,
  },

  chatReceived: {
    backgroundColor: "#767c8c",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginLeft: 10,
    marginTop: 5,
  },

  chatView1: {
    flexDirection: "row",
    marginLeft: "auto",
    alignItems: "center",
    gap: 1,
  },

  chatMsg: {
    color: "white",
    fontSize: 15,
    fontFamily: "Montserrat-Medium",
  },

  chatTime: {
    color: "#d4d6d8",
    fontSize: 11,
    fontFamily: "Montserrat-Medium",
  },

  tick: {
    flexDirection: "row",
    position: "relative",
  },

  chatIconSent: {
    paddingLeft: 4,
    color: "#d4d6d8",
  },

  chatIconSeen: {
    color: "#0DCAF0",
    position: "absolute",
    left: 10,
  },

  chatList: {
    width: "100%",
    paddingVertical: 10,
  },
});
