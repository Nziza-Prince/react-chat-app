import React, { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Chat = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [text, setText] = useState("");
  const [chats, setChats] = useState(null);
  const { chatId, user, isCurrentUserBlocked, isReciverBlocked } = useChatStore();
  const { currentUser } = useUserStore();
  const endRef = useRef(null);
  const [img, setImg] = useState({ file: null, url: "" });

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  useEffect(() => {
    if (!chatId) return;

    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChats(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleSend = async () => {
    if (text === "") return;
    let imgUrl = null;
    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userChats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);
          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
    setImg({ file: null, url: "" });
    setText("");
  };

  const formatDate = (date) => {
    return date.toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non,</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chats?.messages?.map((message, index, arr) => {
          const messageDate = message.createdAt?.toDate();
          const showTime = index === arr.length - 1 || 
                           formatDate(messageDate) !== formatDate(arr[index + 1]?.createdAt?.toDate());

          return (
            <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={index}>
              <div className="texts">
                {message.img && <img src={message.img} alt="" />}
                <p>{message.text}</p>
                {showTime && <span className="time">{formatDate(messageDate)}</span>}
              </div>
            </div>
          );
        })}
        {img.url && 
        <div className="message own">
          <div className="texts">
            <img src={img.url} alt="" />
          </div>
        </div>}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <textarea
            placeholder="Type a message..."
            onChange={(e) => setText(e.target.value)}
            value={text}
            disabled={isCurrentUserBlocked || isReciverBlocked}
            className="styled-textarea"
            rows="1"
            onInput={(e) => {
                e.target.style.height = 'auto'; // Reset height
                e.target.style.height = `${e.target.scrollHeight}px`; // Adjust based on content
            }}
        />
        <div className="emoji">
          <div className="picker">
            {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmoji} />}
          </div>
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />
        </div>
        <button className="sendbtn" onClick={handleSend} disabled={isCurrentUserBlocked || isReciverBlocked}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
