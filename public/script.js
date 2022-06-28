const socket=io('/')
const videoGrid=document.querySelector('.video-container')
const myPeer=new Peer(undefined,{
    host:'/',
    port:'3001'
})
socket.on('a',msg=>console.log(msg))
const myVideo=document.createElement('video')
myVideo.muted=true;
const peers={}
socket.on('connect',()=>{
    console.log("socket id "+socket.id)
    })
navigator.mediaDevices.getUserMedia({audio:true,video:true})
.then(stream=>{
    addVideoStream(myVideo,stream)
   
    socket.on('user-connected',(userID)=>{
        console.log("user connected : "+userID)
        connectToNewUser(userID,stream);
    })
    myPeer.on('call',call=>{
        const video=document.createElement('video')
        call.answer(stream);
        call.on('stream',userVideoStream=>{
            addVideoStream(video,userVideoStream)
        })
    })
    
    })
myPeer.on('open',id=>{
    console.log("join room id : ",id)
    socket.emit('join-room',ROOM_ID,id);
    
})
socket.on('user-disconnected',userID=>{
    console.log("user disconnected")
    if(peers[userID])
        peers[userID].close()
})

function addVideoStream(video,stream)
{
    video.srcObject=stream;
    video.onloadedmetadata=(e)=>video.play();
    videoGrid.append(video)
}
function connectToNewUser(userID,stream)
{
    const call=myPeer.call(userID,stream);
    const video=document.createElement('video')
    call.on('stream',userVideoStream=>{
        addVideoStream(video,userVideoStream)
    })
    call.on('close',()=>{
        video.remove()
    })
    peers[userID]=call
}