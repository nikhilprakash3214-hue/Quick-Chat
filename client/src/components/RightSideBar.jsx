import React ,{ useContext, useEffect, useState } from "react"
import { ChatContext } from "../../context/ChatContext"
import { AuthContext } from "../../context/AuthContext"
import assets from "../assets/assets"


const RightSideBar = () => {
  const { selectedUser, messages } = useContext(ChatContext)
  const { logout, onlineUsers } = useContext(AuthContext)
  const [msgImages, setMsgImages] = useState([])

  useEffect(() => {
    // Only filter if messages exist to prevent errors
    if (messages) {
      setMsgImages(
        messages.filter(msg => msg.image).map(msg => msg.image))
    }
  }, [messages])

  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll $
      {selectedUser ? "max-lg:hidden" : ""}`}>
      
      <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" 
          className='w-20 aspect-square rounded-full'/>
        <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2'>

          {onlineUsers.includes(selectedUser.id)  && <p className='w-2 h-2 rounded-fullbg-green-500'></p>}
          {selectedUser.fullName}
        </h1>
        <p className='px-10 mx-auto'>{selectedUser.bio}</p>
      </div>

      <hr className="border-[#ffffff50] my-4 "/>

      {/* Media Gallery */}
      <div className="px-5 text-xs flex-1 overflow-hidden flex flex-col">
        <p className='mb-2'>Media</p>
        <div className='mt-2 max-h[200px] overflow-y-scroll grid grid-cols-3 gap-2  opacity-80'>
           {msgImages.map((url, index) => (
              <div key={index} onClick={() => window.open(url)} className='cursor-pointer rounded'>
                <img src={url} alt="" className="h-full rounded-md"/>
              </div>
            ))}
        </div>
      </div>
   
      {/* Logout Button */}
        {/* Logout Button */}
<button 
  onClick={() => logout()} 
  className='absolute bottom-6 left-1/2 -translate-x-1/2 bg-linear-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-3 px-15 rounded-full cursor-pointer whitespace-nowrap'
>
  Log Out
</button>
    </div>
  )
}

export default RightSideBar