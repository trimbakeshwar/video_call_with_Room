import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import cameravideo from "../assets/cameravideo.svg"
import cameravideooff from "../assets/cameravideooff.svg"
import endcall from "../assets/endcall.svg"
import micmute from "../assets/micmute.svg"
import mic from "../assets/mic.svg"
import "./room.scss"
const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
height: 30%;
width: 30%;
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
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
    }, []);

    return (
        <StyledVideo id='localVideo' playsInline autoPlay ref={ref} onPlayCapture={VolumeSetting} />
    );
}
function VolumeSetting() {
    var vid = document.getElementById("localVideo");
    vid.volume = 0.0;
 
  }

const videoConstraints = {
    // height: "250px",
    // width:"80%"
};
//const [videoStart, setVideoStart] = useState(false);
const Room = (props) => {
    const [peers, setPeers] = useState([]);
    

  //const [audioOff, setaudioOff] = useState(true);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;

    useEffect(() => {
        socketRef.current = io.connect("https://ndjs-test-video.shopster.chat");
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
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
    // const videohandler = () => {
    //     setVideoStart(!videoStart)
    //   }
    //   const audiohandler = () => {
    //     setaudioOff(!audioOff)
    //   }
      const stopCall = () => {

        userVideo.current.srcObject = null;
        window.location.replace('/');
      }
    return (
        <Container>
            <StyledVideo id='localVideo' playsInline muted  ref={userVideo} autoPlay  onPlayCapture={VolumeSetting} />
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
        </div>
        <div className="videoCon">
          {audioOff ?
            <img src={mic} onClick={audiohandler} /> :
            <img src={micmute} onClick={audiohandler} />}
        </div> */}
        <div className="videoCon">
          <img id="endCall" className="logSize" src={endcall} onClick={stopCall} />
        </div>
      </div>
        </Container>
    );
};

export default Room;
