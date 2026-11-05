import AuthForm from './components/AuthForm';
import Home from './components/Home';
import NavigationBar from './components/NavigationBar';
import Notifications from './components/Notifications';
import Messages from './components/Messages';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation
} from 'react-router-dom';

function App() {
  const isAuthPath = ['/login', '/signup'].includes(useLocation().pathname);
  
  return (
    <>
    {!isAuthPath&& <NavigationBar />}
      <Routes>
        <Route path="/login" element={<AuthForm isLogin={true} />} />
        <Route path="/signup" element={<AuthForm isLogin={false} />} />
        <Route path="/" element={<Home/>} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </>
  )
}

export default App
