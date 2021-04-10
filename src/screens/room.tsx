import { RouteProp, useNavigation } from "@react-navigation/native";
import React, { FC, useEffect, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/screen";
import { Channel, User } from "../models/channel";
import { StackParamList } from "../navigator";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import FastImage from "react-native-fast-image";
import { useTheme } from "../contexts/theme/context";
import defaultAvatar from "../assets/default-avatar";
import Touchable from "../components/touchable";
import { useRoom } from "../contexts/room/context";

interface Props {
  route: RouteProp<StackParamList, "Room">;
}

const Room: FC<Props> = ({ route }) => {
  const { room, loading, rtc, pubnub, join, leave, speakingUsers } = useRoom();
  const [isMount, setIsMount] = useState(false);
  useEffect(() => {
    join && join(route.params.channel);
    initPubnub();
    setIsMount(true);
  }, []);
  const { goBack, navigate } = useNavigation();
  const { theme } = useTheme();

  const initPubnub = () => {
    pubnub?.addListener({
      message: handlePubnubMessage,
      status: (event) => console.log("pubnub status", event),
    });
  };

  const handlePubnubMessage = (msg: any) => {
    console.log("pubnub message:", msg);
    const { message } = msg;
    if (message.channel !== route.params.channel) return;
    if (message.action === "join_channel") {
      onPubnubUserJoined(message);
    }
    if (message.action === "leave_channel") {
      onPubnubUserLeaved(message);
    }
  };

  const onPubnubUserJoined = (message: any) => {
    const user = message.user_profile;
    // @ts-ignore
    setChannel((prevState) => ({
      ...prevState,
      users: [...(prevState?.users ?? []), user],
    }));
  };

  const onPubnubUserLeaved = (message: any) => {
    // @ts-ignore
    setChannel((prevState) => ({
      ...prevState,
      users:
        prevState?.users?.filter((u) => u.user_id !== message.user_id) ?? [],
    }));
  };

  const renderUser = (user: User) => {
    const isAudience = !user.is_speaker && !user.is_followed_by_speaker;
    const isSpeaking = speakingUsers.includes(user.user_id);
    return (
      <Touchable
        style={[styles.user, isAudience && styles.userSmall]}
        onPress={() =>
          navigate("UserProfile", { user_id: user.user_id, user: user })
        }
        key={user.user_id.toString()}
      >
        <View style={isSpeaking && styles.userAvatarSpeaking}>
          <FastImage
            source={{
              uri: user.photo_url ?? defaultAvatar,
            }}
            style={[styles.userAvatar, isAudience && styles.userAvatarSmall]}
          />
          {user.is_speaker && (
            <View
              style={[styles.userMicContainer, { backgroundColor: theme.bg2 }]}
            >
              <MaterialCommunityIcons
                name="microphone"
                size={18}
                color={theme.fg}
              />
            </View>
          )}
        </View>

        <Text style={[styles.userName, { color: theme.fg }]}>{user.name}</Text>
      </Touchable>
    );
  };

  const speakers = useMemo(
    () => room?.users.filter((user) => user.is_speaker),
    [room?.users.length]
  );
  const followedBySpeakers = useMemo(
    () =>
      room?.users.filter(
        (user) => !user.is_speaker && user.is_followed_by_speaker
      ),
    [room?.users.length]
  );
  const audience = useMemo(
    () =>
      room?.users.filter(
        (user) => !user.is_speaker && !user.is_followed_by_speaker
      ),
    [room?.users.length]
  );

  const renderItem = ({ item }: any) => renderUser(item);

  return (
    <Screen>
      <FlatList
        contentContainerStyle={[styles.body, { backgroundColor: theme.bg2 }]}
        ListHeaderComponent={
          loading ? null : (
            <>
              <Text style={[styles.topic, { color: theme.fg }]}>
                {room?.topic}
              </Text>
              <View style={styles.usersContainer}>
                {speakers?.map(renderUser)}
              </View>
              <Text style={[styles.sectionTitle, { color: theme.fg2 }]}>
                Followed by speakers
              </Text>
              <View style={styles.usersContainer}>
                {followedBySpeakers?.map(renderUser)}
              </View>
              <Text
                style={[
                  styles.sectionTitle,
                  { marginBottom: 16, color: theme.fg2 },
                ]}
              >
                Audience ({audience?.length})
              </Text>
            </>
          )
        }
        data={isMount ? audience : []}
        renderItem={renderItem}
        numColumns={4}
        keyExtractor={(item) => item.user_id.toString()}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => {}} />
        }
      />
      {/* <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={getRoom} />
        }
        removeClippedSubviews={Platform.OS === "android"}
      >
        {!loading && (
          <>
            <Text style={styles.topic}>{channel?.topic}</Text>
            
            <View style={styles.usersContainer}>
              {speakers?.map(renderUser)}
            </View>
            <Text style={styles.sectionTitle}>Followed by speakers</Text>
            <View style={styles.usersContainer}>
              {followedBySpeakers?.map(renderUser)}
            </View>
            <Text style={styles.sectionTitle}>Audience</Text>
            <View style={styles.usersContainer}>
              {audience?.map(renderUser)}
            </View>
          </>
        )}
      </ScrollView> */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.leaveButton, { backgroundColor: theme.bg2 }]}
          disabled={loading}
          onPress={() => {
            leave && leave();
            goBack();
          }}
        >
          <Text style={[styles.leaveButtonTitle]}>✌️ Leave quietly</Text>
        </TouchableOpacity>
        <View style={[styles.raiseHandButton, { backgroundColor: theme.bg2 }]}>
          <MaterialCommunityIcons
            name="hand-right"
            size={25}
            style={{ marginRight: 2 }}
            color={theme.fg}
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  body: {
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    marginTop: 16,
    padding: 24,
    minHeight: "100%",
  },
  topic: {
    fontFamily: "Nunito-Bold",
    color: "#454245",
    fontSize: 15,
  },

  usersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 16,
  },

  sectionTitle: {
    color: "#d7d5d8",
    marginLeft: 16,
    fontFamily: "Nunito-Bold",
  },

  user: {
    width: 100 / 3 + "%",
    alignItems: "center",
    marginBottom: 24,
  },
  userSmall: {
    width: 100 / 4 + "%",
  },
  userName: {
    fontFamily: "Nunito-Bold",
    color: "#4e4b4e",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  userAvatar: {
    borderRadius: 72 / 2.5,
    width: 72,
    height: 72,
  },
  userAvatarSmall: {
    borderRadius: 28,
    width: 54,
    height: 54,
  },
  userAvatarSpeaking: {
    borderWidth: 3,
    borderColor: "#CCCBC5",
    padding: 3,
    borderRadius: 34,
  },
  userMicContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FEFCFF",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    height: 72,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  leaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#B8B7B9",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveButtonTitle: {
    fontFamily: "Nunito-Bold",
    color: "#8E4B60",
  },
  raiseHandButton: {
    padding: 8,
    backgroundColor: "#B8B7B9",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
});

export default Room;
