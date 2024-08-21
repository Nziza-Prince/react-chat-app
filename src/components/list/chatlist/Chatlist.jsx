import React, { useEffect, useState } from "react";
import "./chatlist.css";
import AddUser from "./addUser/AddUser";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
const Chatlist = () => {
  const [addMode, setAddmode] = useState(true);
  const [chats, setChats] = useState([]);
  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();
  const [chatInput,setChatInput] = useState("")
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(
      doc(db, "userChats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unsub();
    };
  }, [currentUser.id]);

  // Chatlist.jsx
  const handleSelect = async (chat) => {
    const userChats = chats.map((item)=>{
      const {user,...rest} = item
      return rest
    })

    const chatIndex = userChats.findIndex((item)=>item.chatId === chat.chatId)
    userChats[chatIndex].isSeen=true

    const userChatsRef = doc(db,"userChats",currentUser.id)

    try{
      await updateDoc(userChatsRef,{
        chats:userChats,
      })
      changeChat(chat.chatId, chat.user.id); // Ensure that user.id is passed instead of chat.user
    }catch(err){
      console.log(err)
    }

  };
const filteredChats = chats.filter(c=>c.user.username.toLowerCase().includes(chatInput.toLowerCase()))
  return (
    <>
      <div className="chatlist">
        <div className="search">
          <div className="searchbar">
            <img src="./search.png" alt="" />
            <input type="text" placeholder="Search" onChange={(e)=>setChatInput(e.target.value)}/>
          </div>
          <div className="add">
            {addMode ? (
              <img src="./plus.png" alt="" onClick={() => setAddmode(false)} />
            ) : (
              <img src="./minus.png" alt="" onClick={() => setAddmode(true)} />
            )}
          </div>
        </div>
      </div>
      {filteredChats.map((chat) => (
        <div
          className="chats"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{backgroundColor:chat?.isSeen?"transparent":"#5183fe"}}
        >
          <img src={chat.user.avatar || "./avatar.png"} alt="" />
          <div className="messages">
            <span>{chat.user.username}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode || <AddUser />}
    </>
  );
};

export default Chatlist;
