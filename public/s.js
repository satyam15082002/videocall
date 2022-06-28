const videoGrid=document.querySelector('.video-grid')
const peerInput=document.querySelector('#peer-id')
const socket=io('/')
const myPeer=new Peer()
const userData={
    stream:null,
    id:null,
}
const peers={}
socket.on('connect',()=>{
})
socket.on('user-disconnected', userID=>{
    if(peers[userID])
        peers[userID].close()
})

navigator.mediaDevices.getUserMedia({audio:true,video:true})
.then(stream=>{
    userData.stream=stream
    const videoContainer=createVideoContainer(stream)
    videoGrid.append(videoContainer)
    answerFunction(stream);
})
socket.on('user-connected',userID=>{

})
myPeer.on('open',id=>{
    userData.id=id
    socket.emit('join-room',ROOM_ID,userData.id);
})



function callFunction(peerID)
{
    const videoContainer=createVideoContainer(null)
    var call = myPeer.call(peerID, userData.stream);
    call.on('stream', function(remoteStream) {
        videoContainer.querySelector('video').srcObject=remoteStream;
        videoGrid.append(videoContainer)
    });
    call.on('close',()=>{
        videoContainer.remove();
    })
    peers[peerID]=call;
}
socket.on('ready-call',id=>{
    callFunction(id);
    console.log("call ready : ",id)
})

function answerFunction(stream)
{
    const videoContainer=createVideoContainer(null)
    myPeer.on('call',call=>{
        call.answer(stream)
        call.on('stream',remoteStream=>{
            videoContainer.querySelector('video').srcObject=remoteStream
            videoGrid.append(videoContainer)
        })
    })
    socket.emit('ready-to-call',userData.id);
}


function createVideoContainer(stream)
{
    const videoContainer=document.querySelector('#videoTemplate').content.cloneNode(true)
    const videoElement=videoContainer.querySelector('video')
    const micBtn=videoContainer.querySelector('.mic')
    const maxmizeBtn=videoContainer.querySelector('.maxmize')

    if(stream!==null)
        videoElement.srcObject=stream

    videoElement.onloadedmetadata=()=>videoElement.play();

    micBtn.onclick=()=>{
        videoElement.muted=!videoElement.muted
        micBtn.classList.toggle('fa-microphone-slash')
    }

    maxmizeBtn.onclick=(e)=>{
        videoElement.parentElement.requestFullscreen()
    }

    return videoContainer;
}