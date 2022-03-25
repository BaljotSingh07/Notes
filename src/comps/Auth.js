import {Center, TextInput, Title, SimpleGrid, Button, Anchor, Text, LoadingOverlay} from '@mantine/core'
import {useInputState} from '@mantine/hooks'
import {useNotifications} from '@mantine/notifications'
import {Lock, AccountCircle, Login, Google, Security, Check} from '@mui/icons-material'
import { useContext, useState } from 'react';
import userpool from '../userpool';
import {AuthenticationDetails, CognitoUser} from 'amazon-cognito-identity-js';
import {UserContext} from '../App'
 

function ConfimComp({authHandler, email}){
  const [code, setCode] = useInputState();
  const notification = useNotifications();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  function showNotification(title, msg, err){
    notification.showNotification({
      title : title,
      autoClose : true,
      message : msg,
      color : err ? "red" : "green",
      onClose : () => {setError(false)}
    })
  }

  function resendCode(){
    const cognitoUser = new CognitoUser({Username: email, Pool: userpool});
    setLoading(true)
    cognitoUser.resendConfirmationCode((err, res) => {
      if (err)
        showNotification("An error occured",err.message, true)
      else
        showNotification('Send',`Code send to ${email}`, false)
    setLoading(false)
    })
  }

  function confirmUser(){
    const cognitoUser = new CognitoUser({Username: email, Pool: userpool});
    setLoading(true)
    cognitoUser.confirmRegistration(code, true, function(err, result) {
      if (err) {
        setError(true);
        showNotification("Invalid Code",err.message, true);
        setLoading(false)
        return;
      }
      authHandler('login');
    });
   }
  
  return(
    <Center sx={{height: "90vh"}}>
        <SimpleGrid cols={1} sx={{maxWidth: "400px", backgroundColor: "#ffffff" ,border: "1px solid #d4d4d4", borderRadius:"5px" , padding: "25px"}}>
          <LoadingOverlay visible={loading} />
          <Title align='center'>Confirmation Code</Title>
          <Text>Please enter the confirmation code below that has been sent to {email}.</Text>
          <TextInput  icon={<Security/>} error={error} onChange={setCode}></TextInput>
          <Anchor onClick={resendCode} target="_blank">Didn't recieve a code?</Anchor>
          <Button leftIcon={<Check/>} onClick={confirmUser}>Submit</Button>
        </SimpleGrid>
    </Center>
  )
}

function LoginComp({authHandler}){
  const [email, setEmail] = useInputState('');
  const [password, setPassword] = useInputState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false); 
  const notification = useNotifications();
  const user = useContext(UserContext);

  function showNotification(msg){
    setError(true);
    setLoading(false);
    notification.showNotification({
      title : "Invalid email or password",
      message : msg,
      color : "red",
      onClose : () => {setError(false)}
    })
  }

  function login(){
    setLoading(true);
    const authenticationDetails = new AuthenticationDetails({Username: email, Password: password});
    const userData = {
      Username: email,
      Pool: userpool
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
          //confirmUser(cognitoUser);
          user.updateUser();
      },
  
      onFailure: function(err) {
        if(err.message === "User is not confirmed."){
          authHandler('confirm', email)
        }else{
          showNotification(err.message)
        }
      }
  });
  }

  return(
    <Center sx={{height: "90vh"}}>
        <SimpleGrid cols={1} sx={{minWidth: "400px", backgroundColor: "#ffffff" ,border: "1px solid #d4d4d4", borderRadius:"5px" , padding: "25px"}}>
          <LoadingOverlay visible={loading} />
          <Title align='center'>Login</Title>
          <TextInput type='email' error={error} onChange={setEmail} value={email} icon={<AccountCircle></AccountCircle>} label='Email'></TextInput>
          <TextInput type='password' error={error} onKeyDown={(e) => {if (e.key === "Enter") login()}} onChange={setPassword} value={password} icon={<Lock></Lock>} label='Password'></TextInput>
          <Anchor target="_blank">Forgot password?</Anchor>
          <Anchor onClick={() => {authHandler('signup', '')}} target="_blank">Don't have an account?</Anchor>
          <Button onClick={login} leftIcon={<Login/>}>Login</Button>   
          <Text align='center'>OR</Text>
          <Button leftIcon={<Google/>} color={"yellow"}>Continue With Google</Button>                                                                      
        </SimpleGrid>
    </Center>
  )
}

function SignUpComp({authHandler}){
  const [email, setEmail] = useInputState('');
  const [password, setPassword] = useInputState('');
  const [secondPassword, setSecondPassword] = useInputState('');
  const [secondPasswordError, setSecondPasswordError] = useInputState(false);
  const [error, setError] = useState(false);
  const notification = useNotifications();

  function checkSecondPassword(value){
    setSecondPassword(value);
    setSecondPasswordError(value !== password);
  }

  function showNotification(msg){
    notification.showNotification({
      title : "SignUp Failed",
      autoClose : false,
      message : msg,
      color : "red",
      onClose : () => {setError(false)}
    })
  }

  function signUp(){
    if(secondPasswordError){
      showNotification("Password does not match with conform password.")
      return
    }

    userpool.signUp(email, password, [], null, function(err, res){
      if(err){
        showNotification(err.message);
      }
      if(res)
        authHandler('confirm',email)
    })
  }

  return(
    <Center sx={{height: "90vh"}}>
        <SimpleGrid cols={1} sx={{minWidth: "400px", backgroundColor: "#ffffff" ,border: "1px solid #f7f7f7", borderRadius:"5px" , padding: "25px"}}>
          <Title align='center'>SignUp</Title>
          <TextInput type='email' onChange={setEmail} value={email} icon={<AccountCircle></AccountCircle>} label='Email'></TextInput>
          <TextInput type='password' onChange={setPassword} value={password} icon={<Lock></Lock>} label='Password'></TextInput>
          <TextInput type='password' error={secondPasswordError} onChange={(e) => {checkSecondPassword(e.target.value)}} value={secondPassword} icon={<Lock></Lock>} label='Confirm Password'></TextInput>
          <Anchor onClick={() => {authHandler('login',email)}} target="_blank">Already have an account?</Anchor>
          <Button onClick={signUp} leftIcon={<Login/>}>SignUp</Button>   
          <Text align='center'>OR</Text>
          <Button leftIcon={<Google/>} color={"yellow"}>Continue With Google</Button>   
        </SimpleGrid>
    </Center>
  )
}

function AuthPage(){
  const [currentAuth, setCurrentAuth] = useState(['login', '']);
  
  function changeAuth(auth, email){
    setCurrentAuth([auth, email]);
  }

  function renderAuth(){
    switch (currentAuth[0]) {
      case "login":
        return <LoginComp authHandler={changeAuth} />

      case "signup":
        return <SignUpComp authHandler={changeAuth}/>

      case "confirm":
        return <ConfimComp email={currentAuth[1]} authHandler={changeAuth} />
      default:
        break;
    }
  }

  return(
    <>
    {renderAuth()}
    </>
  )
}

function Auth() {
  return (
    <AuthPage/>
  );
}

export default Auth;
