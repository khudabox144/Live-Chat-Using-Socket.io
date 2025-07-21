import React, { useEffect, useState } from 'react';
import socket from './socket';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [email, setEmail] = useState("");
  const [isRegistered, setRegisterd] = useState(false);
  const [toEmail, setToEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    if (email.trim()) {
      socket.emit("register", email.trim());
      setRegisterd(true);
    }
  };

  // const handleSubmit=(e)=>{
  //     e.preventDefault();
  //     const message=e.target.msg.value;
  //     console.log(message);
  //
  //     if(!message.trim()) return;
  //
  //     //Emit message to server 
  //     socket.emit('sendMessage',message);
  //
  //     console.log("Message Sent",message);
  //
  //     setMessages((prev)=>[...prev,`you:${message}`]);
  //
  //     e.target.msg.value='';
  // }

  //send private message to specific email
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || !toEmail.trim()) return;

    socket.emit("sendMessageToUser", {
      toEmail: toEmail.trim(),
      fromEmail: email.trim(),
      message: message.trim(),
    });

    setMessages((prev) => [...prev, `You to ${toEmail}: ${message}`]);
    setMessage("");
  };

  // useEffect(()=>{
  //     // Listen for messagesd from the server 
  //     socket.on('recieveMessage',(msg)=>{
  //         console.log("Message Recieved",msg);
  //         setMessages((prev)=>[...prev,`Server:${msg}`]);
  //
  //     });
  //      return ()=>{
  //             socket.off('recieveMessage');//clean listener on unmount 
  //         }
  // },[]);

  // Listen for private messages sent to this user 
  useEffect(() => {
    if (!isRegistered) return;

    const handleMessage = ({ fromEmail, message }) => {
      setMessages((prev) => [...prev, `${fromEmail}: ${message}`]);
    };

    socket.on("recieveMessage", handleMessage);
    return () => socket.off("recieveMessage", handleMessage);
  }, [isRegistered]);

  if (!isRegistered) {
    return (
      <div className="w-100 mx-auto border-2 p-4 max-w-md">
        <h2>Register with your email to start chatting</h2>
        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-2 p-2 w-full"
          />
          <br />

          <button
            type="submit"
            className="mt-2 p-2 bg-blue-500 text-white rounded w-full"
          >
            Register
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-100 mx-auto border-2 p-4 max-w-md">
      {/* this will be the msg showing section */}
      <div className="mb-4 h-64 overflow-y-auto border p-2">
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
      {/* this will be the input section  */}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Recipient email"
          name="email"
          type="email"
          value={toEmail}
          onChange={(e) => setToEmail(e.target.value)}
          className="border-2 p-2 mb-2 w-full"
          required
        />
        <input
          placeholder="Write your message"
          name="msg"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-2 p-2 mb-2 w-full"
          required
        />
        <button
          type="submit"
          className="p-2 bg-green-500 text-white rounded w-full"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
