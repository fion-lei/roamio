import { Text, View } from "react-native";
// import Intro from '../components/Intro';
// import Login from '../components/Login';
import SignUp from '../components/SignUp'
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
      }}
    >
     {/* <Intro/> */}
     {/* <Login/> */}
     <SignUp/>
    </View>
  );
}
