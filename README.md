# Clubhouse app

Unofficial Clubhouse app, Written in React Native.

## Screenshots

| Light theme | Night theme |
| ----------- | ----------- |
| ![][light]  | ![][dark]   |

## Install

- [Android](https://github.com/arnnis/Sup/releases/latest) - Android apk download
- [IOS](https://arnnis.github.io/Sup) - No export for ios. You can build it from source.
- [Web](https://arnnis.github.io/Sup) - Web version using react-native-web & expo-web, `doesn't work because of CORS`.
<!-- - [Windows](https://github.com/arnnis/Sup/releases/latest) - Windows version using electron
- [Linux](https://github.com/arnnis/Sup/releases/latest) - Linux version using electron -->

[dark]: https://user-images.githubusercontent.com/61647712/114277408-bc69ec00-9a33-11eb-9c9a-775772e73fbc.jpg
[light]: https://user-images.githubusercontent.com/61647712/114277409-be33af80-9a33-11eb-97ba-b905ad096bb7.jpg
[conversation]: https://user-images.githubusercontent.com/56032649/65983227-eda24d00-e489-11e9-9d31-ed6d392237e3.png
[workspaces]: https://user-images.githubusercontent.com/56032649/65982799-0100e880-e489-11e9-87c0-ae898f3603dc.png

## Features

- [x] Login
- [x] Registeration
- [x] List of rooms
- [x] Joining & Listening to room
- [x] user list realtime change (pubnub)
- [x] User profiles
- [x] Night theme
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

To start desktop development server:

```sh
yarn desktop
```

To run android:

```sh
yarn android
```

To run ios:

```sh
yarn ios
```

To build for desktop:

```sh
yarn desktop:release
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
