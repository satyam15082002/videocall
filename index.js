require('dotenv').config()
const express=require('express')
const app=express()
const http=require('http')
const server=http.createServer(app)
const io=require('socket.io')(server);
const {PeerServer} =require('peer')
const peerServer=PeerServer({
    port:3001,
    path:'/'
})
app.set('view engine','ejs')
app.set('views','./views')
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))

const {v4:uuidv4}=require('uuid')

io.on('connection',socket=>{
    socket.on('join-room',(roomID,userID)=>{
        socket.join(roomID);
        socket.to(roomID).emit('user-connected',userID);
        socket.on('disconnect', () => {
            socket.to(roomID).emit('user-disconnected', userID)
          })
        socket.on('ready-to-call',id=>{
            socket.to(roomID).emit('ready-call',id);
        })
    })
})

app.get('/',(req,res)=>{
    res.render('createGroup')
})
app.post('/create',(req,res)=>{
    const groupName=req.body.groupName
    res.redirect(`/${groupName}-${uuidv4()}`);
})
app.get('/:id',(req,res)=>{
    const id=req.params.id;
    res.render('room',{"roomID":id});
})


server.listen(process.env.PORT||3000,(err)=>{
    if(!err)
        console.log("started at 3000");
})

