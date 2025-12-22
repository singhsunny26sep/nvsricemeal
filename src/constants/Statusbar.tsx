import React from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  SafeAreaView,
  StatusBarProps,
  Platform,
} from 'react-native';

const STATUSBAR_HEIGHT = Platform.select({
  ios: 44,
  android: StatusBar.currentHeight || 24,
});
console.log('Statusbar component: STATUSBAR_HEIGHT =', STATUSBAR_HEIGHT, 'Platform:', Platform.OS);

export default (props: StatusBarProps) => {
  const {backgroundColor} = props;
  console.log('Statusbar rendering with backgroundColor:', backgroundColor);
  return (
    <View style={[styles.statusBar, {backgroundColor}]}>
      <SafeAreaView>
        <StatusBar translucent backgroundColor={backgroundColor} barStyle="dark-content" {...props} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
  appBar: {
    backgroundColor: '#79B45D',
  },
  content: {
    flex: 1,
    backgroundColor: '#33373B',
  },
});
