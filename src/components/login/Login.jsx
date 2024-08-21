import React, { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";

const Login = () => {
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [loadingSignUp, setLoadingSignUp] = useState(false);
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

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
      // Create user with email and password
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;
      // Upload avatar image
      const imgUrl = await upload(avatar.file);

      // Store user data in Firestore
      await setDoc(doc(db, "users", uid), {
        username: username,
        email: email,
        avatar: imgUrl,
        id: uid,
        blocked: [],
      });

      // Initialize user chat in Firestore
      await setDoc(doc(db, "userChats", uid), {
        chats: [],
      });

      toast.success("Account created! You can log in now.");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoadingSignUp(false);
    }
  };

  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingSignIn(true)
    const formData = new FormData(e.target);
    const {email,password } = Object.fromEntries(formData);
    try{
      const res = await signInWithEmailAndPassword(auth,email,password)
    }
    catch (err){
      toast.error(err.message)
    }
    finally{
      setLoadingSignIn(false)
    }
    
    toast.success("Logged In successfully!")
 };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back</h2>
        <form action="" onSubmit={handleLogin}>
          <input type="email" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loadingSignIn}>
            {loadingSignIn ? <div className="spinner"></div> : "Sign In"}
          </button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form action="" onSubmit={handleRegister}>
          <label htmlFor="file" style={{ cursor: "pointer" }}>
            <img src={avatar.url || "./avatar.png"} alt="" />
            Upload an image
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input type="text" placeholder="Username" name="username" />
          <input type="email" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loadingSignUp}>
            {loadingSignUp ? <div className="spinner"></div> : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
