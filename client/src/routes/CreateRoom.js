import React, { useState,useRef } from "react";
import { v1 as uuid } from "uuid";
import "./room.scss";
const CreateRoom = (props) => {
    const [roomid,setromid]=useState('')
    const create=async()=> {
        const id = uuid();
       await setromid(id)
        copylink()
      //  props.history.push(`/room/${id}`);
    }
    const joinRoom=()=>{
        props.history.push(`/room/${roomid}`);
    }
    const [urlOfRoom,seturlOfRoom] = useState('')
const copylink =async()=>{
  //  const url  = new URL(window.location.href);
    
   await seturlOfRoom( new URL(window.location.href))
    

}
const [copySuccess, setCopySuccess] = useState('');
const textAreaRef = useRef(null);
function copyToClipboard(e) {
    textAreaRef.current.select();
    document.execCommand('copy');
    // This is just personal preference.
    // I prefer to not show the whole text area selected.
    e.target.focus();
    setCopySuccess('Copied!');
  };

    return (
        <div className="createRoom">
        <div>
            <textarea
          ref={textAreaRef}
          value={`${urlOfRoom}room/${roomid}`}
        />
        </div>
      {
       /* Logical shortcut for only displaying the 
          button if the copy command exists */
       document.queryCommandSupported('copy') &&
        <div>
          <button onClick={copyToClipboard}>Copy</button> 
          {copySuccess}
        </div>
      }
        <button onClick={create}>Create room</button>
        <button onClick={joinRoom}>join room</button>
        </div>
        
    );
};

export default CreateRoom;
