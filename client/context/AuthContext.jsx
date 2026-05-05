import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";


const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

//const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // 1. Check Authentication Status (Runs once on app load)
  const checkAuth = async () => {
    try {
    const {data} = await axios.get("/api/auth/check");
      if(data.success){
         setAuthUser(data.user);
         connectSocket(data.user)
      }
    } catch (error) {
      toast.error(error.message)
  }
  }

// login function to handler  user authentication and socket connection
const login = async (state, credentials) => {
  try{
    const {data} = await axios.post (`/api/auth/${state}`, credentials);
  if (data.success) {
    setAuthUser(data.userData);
    connectSocket(data.userData);
    axios.defaults.headers.common["token"]= data.token;
    setToken(data.token)
    localStorage.setItem("token", data.token)
     toast.success(data.message);
  } else {
    toast.error(data.message)
  }
}catch(error){
  toast.error(error.message)
}
}
//logout function to handler user logout and socket 

const logout = async () => {
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
      setOnlineUsers([]);
      axios,defaults.headers.common["token"]= null;
      toast.success("Logged out successfully");
      socket.disconnect();
    }


  // update profile function to handler user profile updates
   const updateProfile = async (body) => {
    try {
      const {data} = await axios.put("/api/auth/update-profile", body);
      if(data.success){
      setAuthUser(data.user);
      toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  

// connect socket function to handle socket connection 
const connectSocket = (userData)=>{
  if(!userData || socket ?.connected)return
    const newSocket = io(backendUrl, {
        query: {
          userId: userData._id,
        }
      })
      newSocket.connect()
      setSocket(newSocket);

      newSocket.on("getOnlineUsers", (userIds) => {
        setOnlineUsers(userIds);
          })
}

  useEffect(() => {
    if(token){
      axios.defaults.headers.common["token"]= token;
    }
    checkAuth();
  }, []);


  const value ={
        axios,
        authUser,  
        onlineUsers, 
        socket, 
        login, 
        logout, 
        updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}