import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
// import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';
import registerNNPushToken, { registerIndieID } from 'native-notify';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Linking, StatusBar, ToastAndroid, View } from 'react-native';
import { WebView } from 'react-native-webview';
import UserLocation from './UserLocation';
export default function App() {

  const [delay, setDelay] = useState(false);
  const [isUserLocation, setUserLocation] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelay(!delay)
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  registerNNPushToken(10869, 'uoChEQVEdaEjGtwbfs0TGx');

  // const grantPermissions = async () => { await Location.requestForegroundPermissionsAsync() }
  // grantPermissions();
 
  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('notify_id');
      if (value !== null) {
        registerIndieID(`${value}`, 10869, 'uoChEQVEdaEjGtwbfs0TGx');
      }
    } catch (e) {
      // error reading value
    }
  };
  getData();

  const [permission, requestPermission] = Camera.useCameraPermissions();
  if (!permission) { return <View />; }
  if (!permission.granted) { requestPermission(); }

  return (
    <>
      <UserLocation/>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      {delay ? <WebViewScreen setDelay={setDelay} /> : <SplashScreen />}
    </>
  );
}

const SplashScreen = () => {
  return (
    <View style={{ backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <LottieView
        autoPlay
        style={{ width: 180, height: 180 }}
        source={require('./assets/animation.json')}
      />
    </View>
  )
}

const WebViewScreen = ({ setDelay }) => {
  const appUrl = 'https://new-line.sa/tawasol/';
  const webview = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(appUrl);

  const backAction = () => {
    if (canGoBack) {
      webview.current.goBack()
    } else {
      BackHandler.exitApp()
    }
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);
    () => BackHandler.removeEventListener("hardwareBackPress", backAction)
  }, [canGoBack])

  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem('notify_id', value);
      ToastAndroid.show(`This device is linked with your ID ( ${value} )`, ToastAndroid.CENTER);
    } catch (e) {
      // saving error
    }
  };

  return (
    <WebView
      ref={webview}
      source={{ uri: currentUrl }}
      style={{ flex: 1 }}
      // originWhitelist={['*']}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      setSupportMultipleWindows={false}
      onNavigationStateChange={navState => {
        setCanGoBack(navState.canGoBack);
        setCurrentUrl(navState.url);
      }}
      onError={(e) => {
        setDelay(false)
      }}
      shouldInterceptRequest
      onMessage={event => {
        let data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'notify_id') {
          storeData(data.value);
        } else if (data.type === 'open_link') {
          Linking.openURL(data.value);
        }
      }}
    />
  )
}