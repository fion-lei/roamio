import { Text, View } from "react-native";
// import Intro from '../components/Intro';
import Login from '../components/Login';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
      }}
    >
     {/* <Intro/> */}
     <Login/>
    </View>
  );
}
