# Sup

A Slack client with a UI similar to WhatsApp, supports Web, Android, Desktop.

**Do not use this for work, it's experiemental and you might miss important messages due to bugs and
missing features.**

## Screenshots

| Mobile         | Tablet         |
| -------------- | -------------- |
| ![][mobilegif] | ![][tabletgif] |

## Install

- [Android](https://github.com/arnnis/Sup/releases/latest) - Android apk
- [Web](https://arnnis.github.io/Sup) - Web version using react-native-web
- [Windows](https://github.com/arnnis/Sup/releases/latest) - Windows version using electron
- [Linux](https://github.com/arnnis/Sup/releases/latest) - Linux version using electron

[mobilegif]: https://user-images.githubusercontent.com/58140889/71323716-8ecdfc00-24eb-11ea-8740-1325d4457ccc.gif
[tabletgif]: https://user-images.githubusercontent.com/58140889/71326898-5394f280-2516-11ea-8efd-93fb0cab643b.gif
[conversation]: https://user-images.githubusercontent.com/56032649/65983227-eda24d00-e489-11e9-9d31-ed6d392237e3.png
[workspaces]: https://user-images.githubusercontent.com/56032649/65982799-0100e880-e489-11e9-87c0-ae898f3603dc.png

## Todo

- vioce message support

## Donation

If this project help you, you can give me a cup of coffee :)

<a href="https://www.buymeacoffee.com/arnnis" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-red.png" alt="Buy Me A Coffee" height="50" ></a>

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

## License

MIT
