import React, { FC, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/screen";
import req from "../utils/req";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParamList } from "../navigator";
import { LoginResult } from "../types";

import { useDispatch } from "react-redux";
import { authActions } from "../slices/authSlice";

interface Props {
  route: RouteProp<StackParamList, "VerificationCode">;
  navigation: StackNavigationProp<StackParamList, "VerificationCode">;
}

const VerificationCode: FC<Props> = ({ route }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const verifyCode = async () => {
    console.log("phonenumber", route.params.phonenumber);
    const res = await req("/complete_phone_number_auth", {
      method: "POST",
      body: {
        phone_number: route.params.phonenumber,
        verification_code: verificationCode,
      },
    });
    const resJson: LoginResult = await res.json();
    console.log("login result", resJson);
    if (res.ok) {
      dispatch(authActions.setAuth(resJson));
    } else {
      alert(resJson.error_message);
    }
  };

  return (
    <Screen style={{ alignItems: "center" }}>
      <Text style={styles.title}>{`Enter the code \n we just texted you`}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Verification Code"
          onChangeText={setVerificationCode}
          style={styles.input}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={verifyCode}>
        <Text style={styles.buttonTitle}>Next</Text>
        <MaterialCommunityIcons name="chevron-right" size={22} color="#fff" />
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    fontFamily: "Nunito-Light",
    marginTop: "25%",
    textAlign: "center",
  },
  inputContainer: {
    backgroundColor: "#fff",
    width: "70%",
    padding: 8,
    paddingVertical: 8,
    marginTop: 56,
    borderRadius: 4,
  },
  input: {
    fontSize: 17,
    fontFamily: "Nunito-Light",
  },
  button: {
    width: 175,
    backgroundColor: "#5576AB",
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 72,
    borderRadius: 24,
  },
  buttonTitle: {
    color: "#fff",
    fontFamily: "Nunito-SemiBold",
    fontSize: 18,
  },
});

export default VerificationCode;
