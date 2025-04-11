// Entry point in app

import StackNavigator from './navigation/StackNavigator';
import {Provider as PaperProvider} from 'react-native-paper';


export default function Index() {
  // return <StackNavigator />;
  return (
    <PaperProvider>
      <StackNavigator />
    </PaperProvider>
  );
}

