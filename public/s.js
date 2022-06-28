const videoGrid=document.querySelector('.video-grid')
const peerInput=document.querySelector('#peer-id')
const socket=io('/')
const myPeer=new Peer(undefined,{
    host:'/',
    port:'3001'
})
const userData={
    stream:null,
    id:null,
}
const peers={}
socket.on('connect',()=>{
    console.log("connected socket")
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
    console.log("user connected with id :"+userID)
})
myPeer.on('open',id=>{
    userData.id=id
    socket.emit('join-room',ROOM_ID,userData.id);
    console.log("user id : " +userData.id)
})



function callFunction(peerID)
{
    const video=document.createElement('video')
    var call = myPeer.call(peerID, userData.stream);
    call.on('stream', function(remoteStream) {
        addVideoStream(video,remoteStream);
    });
    call.on('close',()=>{
        video.remove();
    })
    peers[peerID]=call;
}
socket.on('ready-call',id=>{
    callFunction(id);
    console.log("call ready : ",id)
})

function answerFunction(stream)
{
    const video=document.createElement('video')
    myPeer.on('call',call=>{
        call.answer(stream)
        call.on('stream',remoteStream=>{
            addVideoStream(video,remoteStream)
        })
    })
    socket.emit('ready-to-call',userData.id);
}

function addVideoStream(video,stream)
{
    video.srcObject=stream;
    video.onloadedmetadata=(e)=>video.play();
    videoGrid.append(video)
}


function createVideoContainer(stream)
{
    const videoContainer=document.querySelector('#videoTemplate').content.cloneNode(true)
    const videoElement=videoContainer.querySelector('video')
    const micBtn=videoContainer.querySelector('.mic')
    const maxmizeBtn=videoContainer.querySelector('.maxmize')

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