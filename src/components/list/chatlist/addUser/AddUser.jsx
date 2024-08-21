import React, { useState } from 'react';
import './addUser.css';
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../../lib/firebase'; // Ensure you are importing your Firebase configuration
import {useUserStore} from '../../../../lib/userStore'
const AddUser = () => {
  const [user, setUser] = useState(null);
  const [searchloading, setSearchLoading] = useState(false);
  const [addloading, setAddLoading] = useState(false);

  const {currentUser} = useUserStore()

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setSearchLoading(true);
    
    // Using `e.target` to get the form element and pass it to `FormData`
    const formData = new FormData(e.target);
    const username = formData.get('username');

    try {
      const userRef = collection(db, 'users');
      const userQuery = query(userRef, where('username', '==', username));
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAdd = async ()=>{
    const chatRef = collection(db,"chats")
    const userChatRef = collection(db,"userChats")
    setAddLoading(true)

    try{
      const newChatRef = doc(chatRef)
       
      await setDoc(newChatRef,{
        createdAt:serverTimestamp(),
        messages:[]
      })
      await updateDoc(doc(userChatRef,user.id),{
        chats:arrayUnion({
          chatId:newChatRef.id,
          lastMessage:"",
          receiverId:currentUser.id,
          updatedAt:Date.now()
        })
      })

      await updateDoc(doc(userChatRef,currentUser.id),{
        chats:arrayUnion({
          chatId:newChatRef.id,
          lastMessage:"",
          receiverId:user.id,
          updatedAt:Date.now()
        })
      })
      console.log(newChatRef.id)
    }catch(err){
       console.log(err)
     }
     finally{
      setAddLoading(false)
     }
   }

  return (
    <div className="adduser">
      <form onSubmit={handleSearch}> {/* Attach handleSearch to onSubmit */}
        <input type="text" placeholder="Username" name="username" required />
        <button type="submit" disabled={searchloading}>
          {searchloading ? <div className="spinner"></div> : 'Search'}
        </button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || './avatar.png'} alt={user.username} />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd} disabled={addloading}>
          {addloading ? <div className="spinner"></div> : 'Add User'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
