import React, { useEffect } from "react";
import { Button, StyleSheet, Text } from "react-native";
import { useDispatch } from "react-redux";
import Screen from "../components/screen";
import { APIResult } from "../models/api";
import { authActions } from "../slices/authSlice";
import req from "../utils/req";

const IsWaitlisted = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    checkWaitlistStatus();
  }, []);

  const checkWaitlistStatus = async () => {
    const res = await req("/check_waitlist_status", { method: "POST" });
    const resJson: APIResult<{
      is_waitlisted: boolean;
      is_onboarding: boolean;
    }> = await res.json();
    console.log("waitlist status", resJson);
    dispatch(
      authActions.setAuth({
        is_waitlisted: resJson.is_waitlisted,
        is_onboarding: resJson.is_onboarding,
      })
    );
    return resJson;
  };

  const logout = () => {
    dispatch(authActions.logout());
  };
  return (
    <Screen style={styles.container}>
      <Text style={styles.invitation}>
        Someone must invite you to Clubhouse first. Ask your friends to invite
        you by phone number.
      </Text>
      <Button title="Logout" onPress={logout} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: "center", alignItems: "center", padding: 16 },
  invitation: {
    fontFamily: "Nunito-SemiBold",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16,
  },
});

export default IsWaitlisted;
