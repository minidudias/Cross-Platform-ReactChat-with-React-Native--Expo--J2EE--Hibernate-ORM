import {router} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {KeyboardAvoidingView,Pressable,SafeAreaView,StyleSheet,Text,TextInput,View} from "react-native";
import {Shadow} from "react-native-shadow-2";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {useState,useEffect} from "react";
import {useFonts} from "expo-font";
import {Image} from "expo-image";
import * as ImagePicker from "expo-image-picker";
import AwesomeAlert from "react-native-awesome-alerts";
import {StatusBar} from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

const logoPath = require("../assets/images/logo.png");

export default function signup() {
  const [getIsPress, setIsPress] = useState(false);
  const [getFirstName, setFirstName] = useState("");
  const [getLastName, setLastName] = useState("");
  const [getMobile, setMobile] = useState("");
  const [getPassword, setPassword] = useState("");
  const [getImage, setImage] = useState(null);
  const [getShowImg, setShowImg] = useState(
    "https://img.icons8.com/sf-black-filled/256/59ce72/folder-invoices.png"
  );
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
          <Image source={logoPath} style={styles.logo} />

          <Text style={styles.text1}>Welcome to React Chat</Text>          

          <Text style={styles.text2}>Create a New Account</Text>

          <Shadow distance={1} offset={[1, 2]} startColor={'#767c8c'}>
            <View style={styles.signUpView1}>
              <FontAwesome name="user" size={25} style={styles.signUpIcon1} />
              <TextInput
                style={styles.signUpInput1}
                autoCorrect={false}
                placeholder="First Name"
                placeholderTextColor="#767c8c" 
                onChangeText={(text) => {
                  setFirstName(text);
                }}
              />
            </View>
          </Shadow>

          <Shadow distance={1} offset={[1, 2]} startColor={'#767c8c'}>
            <View style={styles.signUpView1}>
              <FontAwesome name="user" size={25} style={styles.signUpIcon1} />
              <TextInput
                style={styles.signUpInput1}
                autoCorrect={false}
                placeholder="Last Name"
                placeholderTextColor="#767c8c" 
                onChangeText={(text) => {
                  setLastName(text);
                }}
              />
            </View>
          </Shadow>

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

          <View style={styles.profileSection}>
            <Pressable
              style={{ borderRadius: 75 }}
              onPress={async () => {
                let result = await ImagePicker.launchImageLibraryAsync({});

                if (!result.canceled) {
                  setImage(result.assets[0].uri);
                  setShowImg(result.assets[0].uri);
                }
              }}
            >
              <Image
                style={styles.signupImg}
                source={{
                  uri: getShowImg,
                }}
              />
            </Pressable>
            <Text style={styles.profileText}>
              Choose Your Avatar
            </Text>
          </View>

          <Shadow distance={2} offset={[1, 2]}>
            <View style={styles.signUpView1}>
              <Pressable
                onPress={async () => {
                  setIsPress(true);

                  let formData = new FormData();
                  formData.append("firstName", getFirstName);
                  formData.append("lastName", getLastName);
                  formData.append("mobile", getMobile);
                  formData.append("password", getPassword);

                  if (getImage != null) {
                    formData.append("avatarImage", {
                      name: "avatar.png",
                      type: "image/png",
                      uri: getImage,
                    });
                  }

                  let response = await fetch(
                    process.env.EXPO_PUBLIC_URL+"/ReactChat/CreateAccount",
                    {
                      method: "POST",
                      body: formData,
                    }
                  );

                  if (response.ok) {
                    let json = await response.json();

                    if (json.success) {
                      //user sign up success
                      router.replace("/");
                    } else {
                      setAlertMessage(json.message);
                      setShowAlert(true);
                    }
                  }else{
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

                <Text style={styles.signUpBtnTxt1}>Let's Sign Up</Text>
              </Pressable>
            </View>
          </Shadow>

          <Shadow distance={2} offset={[1, 2]}>
            <View style={styles.signUpView1}>
              <Pressable
                style={styles.signUpButton2}
                onPress={() => {
                  router.replace("/");
                }}
              >
                <Text style={styles.signUpBtnTxt1}>Returning? Sign In</Text>
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
    gap: 15,
    padding: 15,
  },

  logo: {
    height: 120,
    width: 120,
  },

  signupImg: {
    height: 100,
    width: 100,
    borderRadius: 50,
  },

  text1: {
    fontFamily: "Montserrat-Regular",
    fontSize: 24,
    alignSelf: "flex-start",
    color: "#d4d6d8",
    fontWeight:"bold",
    alignSelf:"center"
  },

  text2: {
    fontFamily: "Montserrat-Medium",
    fontSize: 18,
    color: "#708090",
    alignSelf: "flex-start",
    alignSelf:"center",
    marginBottom:10
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
    color:"#d4d6d8",
    paddingStart: 40,
    fontFamily: "Montserrat-Medium",
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  profileText: {
    fontFamily: "Montserrat-Regular",
    fontSize: 16,
    color: "#d4d6d8",
    marginLeft:10,
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
