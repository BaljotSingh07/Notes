import Auth from './comps/Auth'
import userpool from './userpool';
import { useState, createContext } from 'react'
import Main from './comps/Main';

export const UserContext = createContext({
  user: undefined,
  setUser: () => {}
});

function App() {
  const [user, setUser] = useState({
    user : userpool.getCurrentUser(),
    updateUser : () => setUser({...user, user : userpool.getCurrentUser()})
  });
  
  return (
    <UserContext.Provider value={user}>
    {user.user ? <Main/> : <Auth/>}
    </UserContext.Provider>
  );
}

export default App;
