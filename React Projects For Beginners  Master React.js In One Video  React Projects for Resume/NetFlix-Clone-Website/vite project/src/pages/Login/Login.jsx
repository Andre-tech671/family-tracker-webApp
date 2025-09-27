import React, {useState} from "react";
import { toast } from "react-toastify";
import './Login.css';
import logo from '../../assets/logo.png'
import {login, signUp} from '../../Firebase.js';


function Login() {
  
  const [signState, setSignState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const user_auth = async(event)=>{
    event.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if(signState ==="Sign In"){
      await login( email.trim(), password);
    }else{
      await signUp(name.trim(), email.trim(), password);
    }
  }
 

  return (
    <div className="login">
      <img src={logo} alt="Netflix Logo" className="login-logo"/>
      <div className="login-form">
        <h1>{signState}</h1>
        <form onSubmit={user_auth}>
          {signState ==="Sign Up" ? 
          <input value={name} onChange={(event)=>{setName(event.target.value)}} 
          type="text" placeholder="Your name"/> : <></>}
          
          <input  value={email} onChange={(event)=>{setEmail(event.target.value)}}  type="email" placeholder="Email" />

          <input  value={password} onChange={(event)=>{setPassword(event.target.value)}}  type="password" placeholder="Password"/>

          <button type='submit'>{signState}</button>

          <div className="form-help">
            <div className="remember">
              <input type="checkbox" id="remember"/>
              <label htmlFor="remember">Remember Me</label>
            </div>
            <p>Need Help?</p>
          </div>
        </form>
        <div className="form-switch">
          {signState ==="Sign In" ? <p>New to Netflix? <span onClick={()=>{setSignState("Sign Up")}}>
            Sign Up Now</span></p> : <p>Already have account? <span onClick={()=>{setSignState("Sign In")}}>Sign In Now</span></p>}
        </div>
      </div>
    </div>
  );
}

export default Login;
