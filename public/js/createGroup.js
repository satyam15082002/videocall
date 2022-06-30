function createGroupDiv(group)
{
    const groupDiv=document.getElementById("groupTemplate").content.cloneNode(true)
    groupDiv.querySelector('a').innerText=group.groupName;
    groupDiv.querySelector('a').href=group.groupLink;
    groupDiv.querySelector('.fa-share').href=group.groupLink;
    document.querySelector('#group-container').append(groupDiv)

}

function loadGroup()
{
    let groupString=localStorage.getItem("groups")
    if(!groupString) return;

    const groups=JSON.parse(groupString)
    groups.forEach(group=>{
        createGroupDiv(group)
    })
}
loadGroup()