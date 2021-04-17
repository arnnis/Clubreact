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
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParamList } from "../navigator";

import { useDispatch } from "react-redux";
import { authActions } from "../slices/authSlice";
import { ActivityIndicator } from "react-native";
import { useToast } from "react-native-fast-toast";
import { LoginResult } from "../models/user";
import Flex from "../components/flex";

interface Props {
  route: RouteProp<StackParamList, "VerificationCode">;
  navigation: StackNavigationProp<StackParamList, "VerificationCode">;
}

const Register: FC<Props> = ({ route }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const register = async () => {
    if (!firstName || !lastName || !username)
      return toast?.show("Please fill all the requested fields");
    if (firstName.length < 2 || lastName.length < 2 || username.length < 2)
      return toast?.show("All fields should be bigger than 2 characters");
    if (username.length > 16)
      return toast?.show("Username can not be bigger than 16 characters");
    setSubmitting(true);
    const resName = await req("/update_name", {
      method: "POST",
      body: {
        name: firstName + " " + lastName,
      },
    });
    const resUsername = await req("/update_username", {
      method: "POST",
      body: {
        username,
      },
    });
    const resNameJson = await resName.json();
    const resUsernameJson: LoginResult = await resUsername.json();
    console.log("signup result", { resNameJson, resUsernameJson });
    if (resNameJson?.success && resUsernameJson?.success) {
      dispatch(authActions.setAuth({ is_onboarding: false }));
    } else {
      const errMsg =
        resNameJson?.error_message || resUsernameJson.error_message;
      errMsg && toast?.show(errMsg);
    }
    setSubmitting(false);
  };

  return (
    <Screen style={styles.container}>
      <Flex direction="row" style={{ width: "70%" }}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 16 }]}>
          <TextInput
            placeholder="First name"
            onChangeText={setFirstName}
            style={[styles.input]}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, width: "50%" }]}>
          <TextInput
            placeholder="Last name"
            onChangeText={setLastName}
            style={styles.input}
          />
        </View>
      </Flex>

      <View style={[styles.inputContainer]}>
        <TextInput
          placeholder="Username"
          onChangeText={setUsername}
          style={styles.input}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={register}>
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Text style={styles.buttonTitle}>Signup</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#fff"
            />
          </>
        )}
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 54,
    alignItems: "center",
  },
  inputContainer: {
    backgroundColor: "#fff",
    width: "70%",
    height: 40,
    marginBottom: 16,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  input: {
    fontSize: 17,
    fontFamily: "Nunito-Regular",
    width: "100%",
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

export default Register;
