# Clubreact

Unofficial Clubhouse app, Written in React Native.

## Screenshots

| Light theme | Night theme |
| ----------- | ----------- |
| ![][light]  | ![][dark]   |

## Install

- [Android](https://github.com/arnnis/clubreact/releases/latest) - Android apk download
- IOS - No export for ios, but you can build it from source yourself.
- [Web demo](https://arnnis.github.io/Clubreact) - Web version using react-native-web & expo-web (login broken due to CORS).
<!-- - [Windows](https://github.com/arnnis/Sup/releases/latest) - Windows version using electron
- [Linux](https://github.com/arnnis/Sup/releases/latest) - Linux version using electron -->

[dark]: https://user-images.githubusercontent.com/61647712/114277408-bc69ec00-9a33-11eb-9c9a-775772e73fbc.jpg
[light]: https://user-images.githubusercontent.com/61647712/114277409-be33af80-9a33-11eb-97ba-b905ad096bb7.jpg

## Features

- [x] Login
- [x] List of rooms
- [x] Joining & Listening to room
- [x] Audience realtime change (pubnub)
- [x] User profiles
- [x] Night theme
- [ ] Registeration
- [ ] Create room
- [ ] Raising hand & speaking
- [ ] Follow & unfollow & lists
- [ ] Update bio
- [ ] Upload avatar
- [ ] Explore page

## Contributing

Run the following to start webpack development server:

```sh
yarn web
```

To run android:

```sh
yarn android
```

To run ios:

```sh
yarn ios
```

To build for android:

```sh
yarn android:release
```

To build for web:

```sh
yarn web:release
```

## Hire

Looking for a React/React-Native Expert? Email at alirezarzna@gmail.com

## License

MIT
