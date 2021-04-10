import { useNavigation } from "@react-navigation/core";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import defaultAvatar from "../assets/default-avatar";
import { useRoom } from "../contexts/room/context";
import { useTheme } from "../contexts/theme/context";
import Touchable from "./touchable";

const RoomMiniPlayer = () => {
  const room = useRoom();
  const { navigate } = useNavigation();
  const { theme } = useTheme();

  if (!room?.room) return null;

  return (
    <Touchable
      style={[styles.container, { backgroundColor: theme.bg2 }]}
      onPress={() =>
        navigate("Room", {
          channel_id: room.room?.channel_id,
          channel: room.room?.channel,
        })
      }
    >
      <View style={styles.avatarsContainer}>
        <Image
          source={{ uri: room.room?.users[0]?.photo_url ?? defaultAvatar }}
          style={styles.avatar}
        />
        <Image
          source={{ uri: room.room?.users[1]?.photo_url ?? defaultAvatar }}
          style={[styles.avatar, { marginLeft: -8 }]}
        />
        <Image
          source={{ uri: room.room?.users[2]?.photo_url ?? defaultAvatar }}
          style={[styles.avatar, { marginLeft: -8 }]}
        />
      </View>
      <Text numberOfLines={1} style={[styles.topic, { color: theme.fg }]}>
        {room.room?.topic}
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
