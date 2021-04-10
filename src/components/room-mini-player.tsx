import { useNavigation } from "@react-navigation/core";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import defaultAvatar from "../assets/default-avatar";
import { useRoom } from "../contexts/room/context";
import { useTheme } from "../contexts/theme/context";
import { RootState } from "../store/store";
import Touchable from "./touchable";

const RoomMiniPlayer = () => {
  const room = useSelector((state: RootState) => state.room.currentRoom);
  const { navigate } = useNavigation();
  const { theme } = useTheme();

  if (!room) return null;

  return (
    <Touchable
      style={[styles.container, { backgroundColor: theme.bg2 }]}
      onPress={() =>
        navigate("Room", {
          channel_id: room?.channel_id,
          channel: room?.channel,
        })
      }
    >
      <View style={styles.avatarsContainer}>
        <Image
          source={{ uri: room?.users[0]?.photo_url ?? defaultAvatar }}
          style={styles.avatar}
        />
        <Image
          source={{ uri: room?.users[1]?.photo_url ?? defaultAvatar }}
          style={[styles.avatar, { marginLeft: -8 }]}
        />
        <Image
          source={{ uri: room?.users[2]?.photo_url ?? defaultAvatar }}
          style={[styles.avatar, { marginLeft: -8 }]}
        />
      </View>
      <Text numberOfLines={1} style={[styles.topic, { color: theme.fg }]}>
        {room?.topic}
      </Text>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    height: 72,
    backgroundColor: "red",
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    elevation: 10,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  avatarsContainer: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  topic: {
    fontFamily: "Nunito-Regular",
  },
});

export default RoomMiniPlayer;
