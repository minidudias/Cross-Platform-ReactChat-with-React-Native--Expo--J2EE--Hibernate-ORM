import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ImageBackground, KeyboardAvoidingView, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { Shadow } from "react-native-shadow-2";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import AwesomeAlert from "react-native-awesome-alerts";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

const logoPath = require("../assets/images/logo-basic.png");

export default function index() {
  const [getIsPress, setIsPress] = useState(false);
  const [getMobile, setMobile] = useState("");
  const [getPassword, setPassword] = useState("");
  const [found, setFound] = useState(false);
  const [getName, setName] = useState("");
  const [getUri, setUri] = useState("");
  const [getBackground, setBackground] = useState(logoPath);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [loaded, error] = useFonts({
    "Montserrat-Black": require("../assets/fonts/Montserrat-Black.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
  });

  useEffect(() => {
    async function checkUserSignIn() {
      try {
        let userJson = await AsyncStorage.getItem("user");

        if (userJson != null) {
          router.replace("/home");
        }
      } catch (error) {
        console.log(error);
      }
    }
    checkUserSignIn();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }


  return (
    <SafeAreaView style={styles.signUp}>
      <StatusBar style="light" backgroundColor="#273443" />
      <KeyboardAvoidingView style={styles.view}>

        <View style={styles.avatar}>

          {found ? (
            <Image
              style={styles.avatarImg}
              source={getUri}
            />
          ) : (
            <ImageBackground source={getBackground} resizeMode="contain" style={styles.backgroundImg}>
              <Text style={styles.avatarText}>{getName}</Text>
            </ImageBackground>
          )}

        </View>

        <Text style={styles.text1}>Hey, Welcome Back</Text>

        <Text style={styles.text2}>Let's Begin the Chat</Text>


        <Shadow distance={1} offset={[1, 2]} startColor={'#767c8c'}>
          <View style={styles.signUpView1}>
            <FontAwesome name="mobile" size={25} style={styles.signUpIcon1} />
            <TextInput
              style={styles.signUpInput1}
              autoCorrect={false}
              inputMode={"numeric"}
              maxLength={10}
              placeholder="Phone Number"
              placeholderTextColor="#767c8c"
              onChangeText={(text) => {
                setMobile(text);
              }}
              onEndEditing={async () => {
                if (getMobile.length == 10) {
                  let response = await fetch(
                    process.env.EXPO_PUBLIC_URL + "/ReactChat/GetLetters?mobile=" +
                    getMobile
                  );

                  if (response.ok) {
                    let json = await response.json();

                    if (json.found) {
                      setFound(true);
                      setUri(
                        process.env.EXPO_PUBLIC_URL + "/ReactChat/AvatarImages/" +
                        getMobile +
                        ".png"
                      );
                    } else {
                      setFound(false);
                      if (json.letters != "") {
                        setName(json.letters);
                        setBackground("");
                      } else {
                        setName("");
                        setBackground(logoPath);
                      }
                    }
                  }
                }
              }}
            />
          </View>
        </Shadow>

        <Shadow distance={1} offset={[1, 2]} startColor={'#767c8c'}>
          <View style={styles.signUpView1}>
            <FontAwesome name="lock" size={25} style={styles.signUpIcon1} />
            <TextInput
              style={styles.signUpInput1}
              secureTextEntry={true}
              placeholder="Password"
              placeholderTextColor="#767c8c"
              onChangeText={(text) => {
                setPassword(text);
              }}
            />
          </View>
        </Shadow>

        <Shadow distance={2} offset={[1, 2]}>
          <View style={styles.signUpView1}>
            <Pressable
              onPress={async () => {
                setIsPress(true);

                let response = await fetch(
                  process.env.EXPO_PUBLIC_URL + "/ReactChat/SignIn",
                  {
                    method: "POST",
                    body: JSON.stringify({
                      mobile: getMobile,
                      password: getPassword,
                    }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (response.ok) {
                  let json = await response.json();

                  if (json.success) {
                    try {
                      await AsyncStorage.setItem(
                        "user",
                        JSON.stringify(json.user)
                      );
                      router.replace("/home");
                    } catch (error) {
                      setAlertMessage("Error on Async Storage");
                      setShowAlert(true);
                    }
                  } else {
                    setAlertMessage(json.message);
                    setShowAlert(true);
                  }
                } else {
                  setAlertMessage("Something Went Wrong!");
                  setShowAlert(true);
                }
              }}
              onPressOut={() => {
                setIsPress(false);
              }}
              style={
                getIsPress == false
                  ? styles.signUpButton1
                  : styles.signUpBtn1Touch
              }
            >
              <AwesomeAlert
                show={showAlert}
                title="Error"
                message={alertMessage}
                closeOnTouchOutside={true}
                showCancelButton={false}
                showConfirmButton={true}
                confirmText="OK"
                onConfirmPressed={() => {
                  setShowAlert(false);
                }}
                confirmButtonColor="#DD6B55"
              />

              <Text style={styles.signUpBtnTxt1}>Continue Signing In</Text>
            </Pressable>
          </View>
        </Shadow>

        <Shadow distance={2} offset={[1, 2]}>
          <View style={styles.signUpView1}>
            <Pressable
              style={styles.signUpButton2}
              onPress={() => {
                router.replace("/signup");
              }}
            >
              <Text style={styles.signUpBtnTxt1}>New Here? Sign Up</Text>
            </Pressable>
          </View>
        </Shadow>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  signUp: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#273443",
  },

  view: {
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
    padding: 15,
  },

  avatar: {
    justifyContent: "center",
    alignItems: "center",
    height: 140,
    width: 140,
    marginBottom: 5
  },

  avatarText: {
    fontFamily: "Montserrat-ExtraBold",
    fontSize: 40,
    color: "#0f9d58",
    alignSelf: "center"
  },

  avatarImg: {
    height: 140,
    width: 140,
    borderRadius: 70,
  },

  backgroundImg: {
    flex: 1,
    justifyContent: "center",
    height: 140,
    width: 140,
    borderRadius: 70,
    backgroundColor: "#59ce72"
  },

  text1: {
    fontFamily: "Montserrat-Regular",
    fontSize: 24,
    alignSelf: "flex-start",
    color: "#d4d6d8",
    fontWeight: "bold",
    alignSelf: "center"
  },

  text2: {
    fontFamily: "Montserrat-Medium",
    fontSize: 18,
    color: "#708090",
    alignSelf: "flex-start",
    alignSelf: "center",
    marginBottom: 10
  },

  signUpView1: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#273443",
    borderRadius: 16,
  },

  signUpIcon1: {
    position: "absolute",
    start: 15,
    color: "#767c8c",
  },

  signUpInput1: {
    height: 46,
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#767c8c",
    borderRadius: 16,
    fontSize: 12,
    color: "#d4d6d8",
    paddingStart: 40,
    fontFamily: "Montserrat-Medium",
  },

  signUpButton1: {
    width: "100%",
    height: 44,
    backgroundColor: "#59ce72",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  signUpBtn1Touch: {
    width: "100%",
    height: 44,
    backgroundColor: "#0f9d58",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  signUpBtnTxt1: {
    color: "white",
    fontSize: 15,
    fontFamily: "Montserrat-Bold",
  },

  signUpButton2: {
    width: "100%",
    height: 44,
    backgroundColor: "#767c8c",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
