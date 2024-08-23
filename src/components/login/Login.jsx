import React, { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [loadingSignUp, setLoadingSignUp] = useState(false);
  const [passwordSignupVisible,setPasswordSignupVisible] = useState(false)
  const [passwordSigninVisible,setPasswordSigninVisible] = useState(false)

  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const showSigninPassword = (e)=>{
    setPasswordSigninVisible(!passwordVisible)
  }
  const showSignupPassword = (e)=>{
    setPasswordSignupVisible(!passwordVisible)
  }

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoadingSignUp(true);
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;
      const imgUrl = await upload(avatar.file);

      await setDoc(doc(db, "users", uid), {
        username: username,
        email: email,
        avatar: imgUrl,
        id: uid,
        blocked: [],
      });

      await setDoc(doc(db, "userChats", uid), {
        chats: [],
      });

      toast.success("Account created! You can log in now.");
    } catch (err) {
      console.error("Error during registration:", err);
      toast.error(err.message);
    } finally {
      setLoadingSignUp(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingSignIn(true);
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", res.user); // Log user details
      toast.success("Login successful!");
    } catch (err) {
      console.error("Error during login:", err);
      toast.error("Invalid credentials");
    } finally {
      setLoadingSignIn(false);
    }
  };
return (
    <div className="login">
      <div className="item">
        <h2>Welcome back</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" name="email" required />
          <div className="password">
           <input type={passwordSigninVisible ? 'text':'password'} placeholder="Password" name="password" required />
           {passwordSigninVisible ? <FaEyeSlash id="eye" onClick={()=>setPasswordSigninVisible(false)}/>:<FaEye id="eye" onClick={()=>setPasswordSigninVisible(true)}/>}
          </div>
          <button disabled={loadingSignIn}>
            {loadingSignIn ? <div className="spinner"></div> : "Sign In"}
          </button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file" style={{ cursor: "pointer" }}>
            <img src={avatar.url || "./avatar.png"} alt="Avatar" />
            Upload an image
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
            required
          />
          <input type="text" placeholder="Username" name="username" required />
          <input type="email" placeholder="Email" name="email" required />
          <div className="password">
           <input type={passwordSignupVisible ? 'text':'password'} placeholder="Password" name="password" required />
        {passwordSignupVisible ? <FaEyeSlash id="eye" onClick={()=>setPasswordSignupVisible(false)}/>:<FaEye id="eye" onClick={()=>setPasswordSignupVisible(true)}/>}
          </div>
         <button disabled={loadingSignUp}>
            {loadingSignUp ? <div className="spinner"></div> : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
