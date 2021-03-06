// stores permissions and tokens on our server
import React from 'react';
import { View, AppState, Linking, Platform, Alert } from 'react-native';

import { Notifications, Permissions, IntentLauncherAndroid } from 'expo';

import moment from 'moment';

export const getPushToken = () => Notifications.getExpoPushTokenAsync();

export const openSettings = () => {
    if(Platform.OS === 'ios') {
        Linking.openURL("app-settings:");
    }
    if(Platform.OS === 'android') {
        IntentLauncherAndroid.startActivityAsync(
            IntentLauncherAndroid.ACTION_APP_NOTIFICATION_SETTINGS
        )
    }
}

export const pushNotificationsEnabled = async () => {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
    };
    if (finalStatus !== 'granted') {
        return false;
    };
    return true;
};

export const registerForPushNotifications = async () => {
    const enabled = await pushNotificationsEnabled();

    if (!enabled) {
        return Promise.resolve();
    };

    return Notifications.getExpoPushTokenAsync();
};

export const setBadgeNumber = (number = 0) => Notifications.setBadgeNumberAsync(number);

export class PushNotificationManager extends React.Component {
    static defaultProps = {
        onPushNotificationSelected: () => null,
        onPushNotificationReceived: () => null
    };
    componentDidMount() {
        setBadgeNumber(0);
        AppState.addEventListener('change', this.handleAppStateChange);
        this.notificationSubscription = Notifications.addListener(this.handlePushNotification)
    };
  
    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
        this.notificationSubscription.remove();
    };
  
    handleAppStateChange = (nextAppState) => {
        if(nextAppState === 'acive') {
            setBadgeNumber(0);
        }
    };

    handlePushNotification = ({ data, origin }) => {
        if (origin === 'selected') {
            //user opened the app via push notification
            this.props.onPushNotificationSelected(data);
        } else if (origin === 'received') {
            //App was open when notification was received
            Alert.alert("New questions available!", "Do you have what it takes?", [
                { text: "Ignore", style: "Cancel" },
                { text: "Show Me", onPress: () => this.props.onPushNotificationReceived(data)}
            ]);
        }
    };
    render() {
        return <View style={{ flex:1 }}>{this.props.children}</View>
    }
};

//local notifications once a week on sunday at 1230 hours
export const scheduleStatsNotification = () => 
    console.log("TRYING TO SEND LOCAL NOTIFICATION")
    Notifications.scheduleLocalNotificationAsync(
        {
            title: "Your stats are in!",
            body: "See how you're doing",
            data: {
                target: "stats"
            }
        },
        {
            // time: moment().seconds(moment().seconds() + 15).toDate(),
            time: moment().day(7).hour(12).minute(30).toDate(),
            repeat: 'week'
        }
    ).catch(() => null)

