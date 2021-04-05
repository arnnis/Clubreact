import { RouteProp, useNavigation } from "@react-navigation/native";
import React, { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "react-query";
import Screen from "../components/screen";
import { Channel, GetChannelsResult } from "../models/channel";
import { StackParamList } from "../navigator";
import req from "../utils/req";

interface Props {
  route: RouteProp<StackParamList, "Room">;
}

const Room: FC<Props> = ({ route }) => {
  const { isLoading, error, data, refetch } = useQuery("room", () => getRoom());
  const { navigate } = useNavigation();

  const getRoom = async () => {
    const res = await req("/get_channel", {
      method: "POST",
      body: {
        channel_id: route.params.channel_id,
        channel: route.params.channel,
      },
    });
    const resJson: Channel = await res.json();
    return resJson;
  };
  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.topic}>{data?.topic}</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  body: {
    backgroundColor: "#fff",
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    height: "100%",
    marginTop: 16,
    padding: 24,
  },
  topic: {
    fontFamily: "Nunito-Bold",
    color: "#454245",
    fontSize: 15,
  },
});

export default Room;
