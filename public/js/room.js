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
    videoContainer.querySelector('video').muted=true
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

const shareButton=document.querySelector('#share-button')

shareButton.addEventListener('click',(e)=>{
    const inviteLink=`${location.origin}/${ROOM_ID}`
    navigator.share({
        title:'share',
        text:`Join group video call ${inviteLink.split("/")[0]}using link`,
        url:inviteLink
    })
})


//persist group
function persistCreatedGroup()
{
    const group={
        groupName:null,
        groupLink:null
    }
    const groupLink=`${location.origin}/${ROOM_ID}`
    group.groupName=ROOM_ID.split("-")[0]
    group.groupLink=groupLink

    var groupsJSONString=localStorage.getItem("groups")
    if(groupsJSONString==null||groupsJSONString=="")
    {
        var groups=[]
        groups.push(group);
        localStorage.setItem("groups",JSON.stringify(groups))
    }
    else
    {
        var groups=JSON.parse(groupsJSONString)
        groups.filter(g=>g.groupUrl!==group.groupUrl)
        groups.push(group);
        console.log(groups)
    }
    localStorage.setItem("groups",JSON.stringify(groups));
}
persistCreatedGroup();
