import { BrowserRouter as Router } from "react-router-dom";

import AuthProvider from "./auth/AuthProvider";
import LoginButton from "./auth/LoginButton";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div>hi</div>
        <LoginButton />
      </AuthProvider>
    </Router>
  );
}

export default App;
