import React, { Component, ComponentType, FC, useContext } from "react";
import RtcEngine, { RtcEngineConfig } from "react-native-agora";
import { connect } from "react-redux";
import { RootState } from "../store/store";

interface ContextValue {
  engine: null | RtcEngine;
}

export const RtcContext = React.createContext({ engine: null } as ContextValue);

type RtcProviderProps = ReturnType<typeof mapStateToProps>;

class RtcProvider extends Component<RtcProviderProps> {
  state = {
    rtcEngine: null as null | RtcEngine,
  };

  componentDidMount() {
    if (this.props.authState.auth_token) this.initRtc();
  }

  componentDidUpdate(prevProps: RtcProviderProps) {
    // on login
    if (!prevProps.authState.auth_token && this.props.authState.auth_token) {
      this.initRtc();
    }

    // on logout
    if (prevProps.authState.auth_token && !this.props.authState.auth_token) {
      this.state.rtcEngine?.destroy();
      console.log("destroyed rtc engine, reason: logout");
    }
  }

  initRtc = async () => {
    console.log("connecting to rtc engine");
    try {
      let rtcEngine = await RtcEngine.createWithConfig(
        new RtcEngineConfig("938de3e8055e42b281bb8c6f69c21f78")
      );
      rtcEngine.setDefaultAudioRoutetoSpeakerphone(true);
      rtcEngine.enableAudioVolumeIndication(1500, 3, false);
      rtcEngine.muteLocalAudioStream(true);

      this.setState({ rtcEngine });
      console.log("rtc engine initialized");
    } catch (err) {
      console.log("error initializing rtc engine", err);
    }
  };

  render() {
    return (
      <RtcContext.Provider value={{ engine: this.state.rtcEngine }}>
        {this.props.children}
      </RtcContext.Provider>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  authState: state.auth,
});

export default connect(mapStateToProps)(RtcProvider);

export const useRtc = () => useContext(RtcContext);

export interface WithRtcProp {
  rtc: ContextValue;
}

export const withRtc = (C: any) => {
  return class extends Component {
    render() {
      return (
        <RtcContext.Consumer>
          {(value) => <C rtc={value} {...this.props} />}
        </RtcContext.Consumer>
      );
    }
  };
};
