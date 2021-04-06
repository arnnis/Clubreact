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
    setSubmitting(false);
    navigate("VerificationCode", { phonenumber: fullPhoneNumber });
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
          containerButtonStyle={{ marginTop: -6, marginBottom: -8 }}
          visible={false}
          theme={{ ...DEFAULT_THEME, backgroundColor: "#f2efe4" }}
        />
        <TextInput
          placeholder="Phone Number"
          onChangeText={setPhonenumber}
          style={styles.input}
          value={phonenumber}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={requestCode}>
        {submitting ? (
          <ActivityIndicator size="small" />
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
    marginTop: "25%",
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
    fontSize: 17,
    fontFamily: "Nunito-Regular",
    width: "100%",
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
