import { RouteProp, useNavigation } from "@react-navigation/native";
import React, { FC, useEffect, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../../components/screen";
import { User } from "../../models/channel";
import { StackParamList } from "../../navigator";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { useTheme } from "../../contexts/theme/context";
import { useRoom } from "../../contexts/room/context";
import UserCell from "./user-cell";

interface Props {
  route: RouteProp<StackParamList, "Room">;
}

const Room: FC<Props> = ({ route }) => {
  const { room, loading, rtc, pubnub, join, leave } = useRoom();
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

  const renderUser = (user: User) => <UserCell user={user} />;

  // const speakers = useMemo(
  //   () => room?.users.filter((user) => user.is_speaker),
  //   [room?.users.length]
  // );
  // const followedBySpeakers = useMemo(
  //   () =>
  //     room?.users.filter(
  //       (user) => !user.is_speaker && user.is_followed_by_speaker
  //     ),
  //   [room?.users.length]
  // );
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
                {room?.users?.map((u) => u.is_speaker && renderUser(u))}
              </View>
              <Text style={[styles.sectionTitle, { color: theme.fg2 }]}>
                Followed by speakers
              </Text>
              <View style={styles.usersContainer}>
                {room?.users?.map(
                  (u) => u.is_followed_by_speaker && renderUser(u)
                )}
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
