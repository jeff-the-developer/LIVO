import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EarningScreen(): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>EarningScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
