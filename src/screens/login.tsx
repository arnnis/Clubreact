import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/screen";
import req from "../utils/req";
import { useNavigation } from "@react-navigation/core";
import CountryPicker, {
  Country,
  DEFAULT_THEME,
} from "react-native-country-picker-modal";
import { useToast } from "react-native-fast-toast";

const Login = () => {
  const [phonenumber, setPhonenumber] = useState("");
  const [country, setCountry] = useState<Country>({
    callingCode: ["1"],
    cca2: "US",
    currency: ["USD"],
    flag: "flag-us",
    name: "United States",
    region: "Americas",
    subregion: "North America",
  });
  const { navigate } = useNavigation();
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const requestCode = async () => {
    let fullPhoneNumber = "";
    if (phonenumber.startsWith("0")) {
      fullPhoneNumber = phonenumber.slice(1, phonenumber.length);
    } else {
      fullPhoneNumber = phonenumber;
    }
    fullPhoneNumber = `+${country.callingCode[0]}${fullPhoneNumber}`;
    console.log("fullPhoneNumber", fullPhoneNumber);

    setSubmitting(true);
    let res = await req("/start_phone_number_auth", {
      method: "POST",
      body: { phone_number: fullPhoneNumber },
    });
    console.log(res);
    const resJson = await res.json();
    if (res.ok) {
      if (resJson.is_waitlisted) {
        return toast?.show("You need to get invited by someone first");
      }
      navigate("VerificationCode", { phonenumber: fullPhoneNumber });
    } else {
      resJson?.error_message && toast?.show(resJson?.error_message);
      resJson?.is_blocked &&
        toast?.show("You are blocked from using clubhouse");
    }
    setSubmitting(false);
  };

  return (
    <Screen style={{ alignItems: "center" }}>
      <Text style={styles.title}>Enter your phone</Text>
      <View style={styles.inputContainer}>
        <CountryPicker
          countryCode={country.cca2}
          withFlag
          withFilter
          withAlphaFilter
          withCallingCode
          onSelect={(country: Country) => {
            console.log("selected country", country);
            setCountry(country);
          }}
          containerButtonStyle={{
            marginTop: -6,
            marginBottom: -8,
            marginRight: -4,
          }}
          visible={false}
          theme={{ ...DEFAULT_THEME, backgroundColor: "#f2efe4" }}
        />
        <Text style={{ fontFamily: '"Nunito-Regular', fontSize: 15 }}>
          +{country.callingCode[0]}
        </Text>
        <TextInput
          placeholder="Phone Number"
          onChangeText={setPhonenumber}
          style={styles.input}
          value={phonenumber}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={requestCode}>
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Text style={styles.buttonTitle}>Next</Text>
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
  title: {
    fontSize: 25,
    fontFamily: "Nunito-Light",
    marginTop: 100,
  },
  inputContainer: {
    backgroundColor: "#fff",
    width: "70%",
    height: 40,
    marginTop: 56,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  input: {
    fontSize: 15,
    fontFamily: "Nunito-Regular",
    width: "100%",
    height: "100%",
    textAlignVertical: "center",
    marginTop: 4,
  },
  button: {
    width: 175,
    backgroundColor: "#5576AB",
    height: 46,
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

export default Login;
