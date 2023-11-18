import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useState } from 'react';

const LOCATION_TRACKING = 'location-tracking';

userID = null;
function UserLocation() {
    const [locationStarted, setLocationStarted] = useState(false);
    const getData = async () => {
        try {
          const value = await AsyncStorage.getItem('notify_id');
          if (value !== null) {
            userID = value;
          }
        } catch (e) {
          // error reading value
        }
      };

      getData();

    const startLocationTracking = async () => {
        await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 180000,
            distanceInterval: 0,
        });
        
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
            LOCATION_TRACKING
        );
        setLocationStarted(hasStarted);
        console.log('tracking started?', hasStarted);
    };

    useEffect(() => {
        const config = async () => {
            let location_foreground = await Location.requestForegroundPermissionsAsync();
            if (location_foreground.status === 'granted') {
                let location_background = await Location.requestBackgroundPermissionsAsync();
                if (location_background.status === 'granted') {
                    console.log('Permission to access location granted');
                }
            } else {
                console.log('Permission to access location was denied');
            }
        };

        config();
    }, []);

    startLocationTracking();

}

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
    if (error) {
        console.log('LOCATION_TRACKING task ERROR:', error);
        return;
    }
    if (data) {
        const { locations } = data;
        let location_obj = {
            user: userID,
            location: `${locations[0].coords.latitude},${locations[0].coords.longitude}`,
        }

        save_user_log(JSON.stringify(location_obj));
    }
});

export default UserLocation;

const save_user_log = (async (user_log) => {
    await fetch(`https://new-line.sa/TempEngin/user-track?user-log=${user_log}`)
        .then(res => res.text())
        .then(result => console.log(result))
})