import { registerRootComponent } from 'expo';
import React from 'react';
import RootLayout from './src/core/_layout';

function App(): React.ReactElement {
  return <RootLayout />;
}

registerRootComponent(App);

export default App;
