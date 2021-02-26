import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
// import cameravideo from "../assets/cameravideo.svg"
// import cameravideooff from "../assets/cameravideooff.svg"
import endcall from "../assets/endcall.svg"
import micmute from "../assets/micmute.svg"
import mic from "../assets/mic.svg"
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import { makeStyles } from '@material-ui/core/styles';
import "./room.scss";
// const Container = styled.div`
//     padding: 20px;
//     display: flex;
//     height: 100vh;
//     width: 90%;
//     margin: auto;
//     flex-wrap: wrap;
// `;

const StyledVideo = styled.video`
height: 30%;
width: 30%;
`;
//const [value, setValue] = React.useState(0);
//   const handleChange = () => {
//   };
// const handleChange = (event, newValue) => {
//   setaudioRange(newValue);
//   console.log("vol",newValue)
// };
const useStyles = makeStyles({
    root: {
      width: 200,
    },
  });
const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
     ;
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
            // if (!videoStart) {
            //     stream.getTracks().forEach(function (track) {
            //       if (track.readyState == 'live' && track.kind === 'video') {
            //         track.enabled = false
            //         // track.stop();
            //       }
            //     });
      
            //   }
        })
         // eslint-disable-next-line
    }, []);

    return (
        <StyledVideo id='localVideo' playsInline autoPlay ref={ref} onPlayCapture={VolumeSetting()}  />
    );
}
function VolumeSetting() {
    console.log("hi")
    var vid = document.getElementById("localVideo");
    vid.volume =0.0
   // vid.muted = window.localStorage.getItem('ismuted');
    
    //console.log("vol",audioControll)
 
  }

// function VolumeSetting() {
//     var vid = document.getElementById("localVideo");
//     vid.volume =0.0;
 
//   }
// function VolumeSetting() {
//     var vid = document.getElementById("otherVideo");
//     vid.volume =0.0;
 
//   }
// const videoConstraints = {
//     // height: "250px",
//     // width:"80%"
// };

const Room = (props) => {
    const classes = useStyles();
    const [peers, setPeers] = useState([]);
  //  const [videoStart, setVideoStart] = useState(false);
  const [audioOff, setaudioOff] = useState(true);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);

    const roomID = props.match.params.roomID;
    
    const [audioControll, setaudioControll] = useState(0.0);
    
const handleChange = async(event, newValue)=>{
    await setaudioControll(newValue/100)
   // window.localStorage.setItem('volume',audioControll)
    console.log("vol",audioControll)
    var vid = document.getElementById("localVideo");
    vid.volume = audioControll;
}
//const [cameraOption,setcameraOption]= useState('front');
//const [ismirror,setismirror]= useState(false)
// const changeCameraType = () => {
//     if (cameraOption === 'back') {
//         setcameraOption ('front')
//         setismirror(true) 
     
//     } else {
//         setcameraOption ('back')
//         setismirror(false)   
//     }
//   }
// const constraint={
//       audio:true,
//       video:{
//         cameraType:cameraOption,
//         mirror:ismirror
//       }
//   }
    useEffect(() => {
      console.log("helo")
        socketRef.current = io.connect("https://ndjs-test-video.shopster.chat");
        VolumeSetting();
        navigator.mediaDevices.getUserMedia({audio:true,video:true}).then(stream => {
            userVideo.current.srcObject = stream;
           
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push(peer);
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                setPeers(users => [...users, peer]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    }, []);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }
    // const videohandler = async() => {
    //     await setVideoStart(!videoStart)
    //     var vid = document.getElementById("localVideo");
    //     if(videoStart){
    //         vid.style.display="none"
    //     }
    //     else{
    //         vid.style.display = true
    //     }
    //   }
      const audiohandler = async() => {
      
       await setaudioOff(!audioOff)
       var vid = document.getElementById("localVideo");
       vid.muted = audioOff;
      
        window.localStorage.setItem('ismuted',audioOff);
      }
      const stopCall = () => {

        userVideo.current.srcObject = null;
        window.location.replace('/');
      }
   
    return (
        <div>
            <StyledVideo  id='localVideo' playsInline muted  ref={userVideo} autoPlay  />
            {peers.map((peer, index) => {
                return (
                    <Video id='myvideo' key={index} peer={peer}  />
                );
            })}
             <div className="buttonsContainer">
        {/* <div className="videoCon">
          {videoStart ?
            <img src={cameravideo} onClick={videohandler} /> :
            <img src={cameravideooff} onClick={videohandler} />}
          </div> */}
        <div className="videoCon">
          {audioOff ?
            <img src={mic} onClick={audiohandler} /> :
            <img src={micmute} onClick={audiohandler} />}
        </div> 
        <div className="videoCon">
          <img id="endCall" className="logSize" src={endcall} onClick={stopCall} />
        </div>
        <div className={classes.root}>
        <Grid container spacing={2}>
        <Grid item>
          <VolumeDown />
        </Grid>
        <Grid item xs>
          <Slider  min={0} max={100} onChange={handleChange} aria-labelledby="continuous-slider" />
        </Grid>
        <Grid item>
          <VolumeUp />
        </Grid>
      </Grid>

        </div>
        
        {/* <div>
            <button onClick={changeCameraType}>chage camera </button>
        </div> */}
      </div>
        </div>
    );
};

export default Room;
