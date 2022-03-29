import { Navbar, Title, TextInput, Button, ScrollArea, Popover, Group, List, Breadcrumbs, LoadingOverlay, SegmentedControl, Anchor, Affix, ActionIcon} from '@mantine/core';
import { useNotifications } from '@mantine/notifications';
import { RichTextEditor } from '@mantine/rte';
import {useInputState} from '@mantine/hooks'
import {Add, Folder, InsertDriveFile, Save, Done, Error} from '@mui/icons-material'
import { useEffect, useRef, useState} from 'react';
import userpool from '../userpool';

function NewNoteComp({handler}){
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [noteName, setNoteName] = useInputState();
    const [type, setType] = useState('file');

    return(
        <Popover
            opened={popoverOpen}
            style={{width: "100%"}}
            onClose={() => {setPopoverOpen(false)}}
            target={<Button  leftIcon={<Add/>} variant="outline" fullWidth onClick={() => {setPopoverOpen(!popoverOpen)}}></Button>}
            position="top"
        >
            <form onSubmit={(e) => {e.preventDefault(); setPopoverOpen(false); handler(noteName, type)}}>
            <SegmentedControl
                fullWidth
                value={type}
                onChange={setType}
                mb={4}
                    data={[
                        { label: 'File', value: 'file' },
                        { label: 'Folder', value: 'dir' }
                    ]}
                    />
                <TextInput mb={4} onChange={setNoteName}></TextInput>
                <Button fullWidth type='submit'>Create</Button>
            </form>
        </Popover>
    )
}


function NestedNav({loadNoteHanlder}){
    const [data, setData] = useState([]);
    const [token, setToken] = useState();
    const [folderPath, setFolderPath] = useState([{title : '', ID : 'root'}]);
    const [loading, setLoading] = useState(false);
    const notification = useNotifications();

    function createNoteHandler(title,type){
        fetch("https://o3145qgy04.execute-api.us-east-1.amazonaws.com/beta/notes",{
            method : "POST",
            headers: {Authorization : token},
            body: JSON.stringify({
                "parent_id" : folderPath[folderPath.length-1].ID,
                "type" : type,
                "title" : title,
            })
        }).then(data => {
            return data.json()
        }).then(jsonData => {
            notification.showNotification({
                title : "Success",
                message : "Successfully created a new note.",
                color : 'green',
                icon : <Done/>
            })
            getChildren(token);
        }).catch(err => {
            notification.showNotification({
                title : "Error",
                message : `${err}`,
                color : 'red',
                icon : <Error/>
            })
        })
    }

    function getChildren(token){
        setLoading(true);
        if(!token) return
        fetch(`https://o3145qgy04.execute-api.us-east-1.amazonaws.com/beta/folders?id=${folderPath[folderPath.length-1].ID}`,{
            headers: {Authorization : token} 
        })
        .then(data => {
            return data.json()
        }).then(jsonData => {
            setData(Object.values(jsonData.Items))
        }).catch(err => {
            notification.showNotification({
                title : "Error",
                message : "An error occured while trying to load folders.",
                color : 'red',
                icon : <Error/>
            })
        }).finally(() => {
        setLoading(false);

        })
    }

    useEffect(function(){
        const cognitoUser = userpool.getCurrentUser();
        let t;
        if (cognitoUser != null) {
            cognitoUser.getSession((err, session) => {
            if (err) {
                console.log(err);
            } else if (!session.isValid()) {
                console.log("Invalid session.");
            } else {
                //console.log("IdToken: " + session.getIdToken().getJwtToken());
                t = session.getIdToken().getJwtToken();
                getChildren(t);
                setToken(t);
            }
            });
        } else {
            console.log("User not found.");
        }

    },[])

    useEffect(function(){
        getChildren(token)
    },[folderPath])

    return(
        <Navbar padding={"md"} height={"95vh"}  width={{ base: 250}}>
            <Navbar.Section mb={"lg"}><Title align='center' order={3}>Choose Notes</Title ></Navbar.Section>
            <Navbar.Section mb={'lg'}>
            <Breadcrumbs styles={{separator : {marginRight : "4px"}}}>
                {folderPath.map((e,i) => {
                    return(
                        <Anchor key={i} onClick={() => {setFolderPath(folderPath.slice(0,i))}}>{e.title}</Anchor>
                    )
                })}
            </Breadcrumbs>
            </Navbar.Section>
            <Navbar.Section grow component={ScrollArea}>
            <LoadingOverlay visible={loading} />

                <List spacing={5}>
                {data.map((e,i)=>{
                    return(
                        <List.Item onClick={e.Type.S === 'dir' ? () => {setFolderPath([...folderPath, {title : e.Title.S, ID : e.Note_ID.S}])} : () => {loadNoteHanlder(e.Note_ID.S)}} key={i} sx={(theme) => ({'&:hover': {backgroundColor: theme.colors.gray[1],cursor : "pointer"},})} 
                        icon={e.Type.S === 'dir' ? <Folder/> : <InsertDriveFile/>} >{e.Title.S}</List.Item>
                    )
               })}
                </List>

                </Navbar.Section>

            <Navbar.Section>
               <NewNoteComp handler={createNoteHandler}/>
            </Navbar.Section>
            
        </Navbar>
    )
}

function Notes({hidden}){
    const [content, setContent] = useInputState('');
    const [currentlyEdditing, setCurrentlyEdditing] = useState();
    const [token, setToken] = useState('');
    const notification = useNotifications();

    function getContent(id){
        fetch(`https://o3145qgy04.execute-api.us-east-1.amazonaws.com/beta/notes?id=${id}`,{
            headers: {Authorization : token} 
        })
        .then(data => {
            return data.json()
        }).then(jsonData => {
            setCurrentlyEdditing(id)
            setContent(jsonData.Items[0].Content.S)
            notification.showNotification({
                title : "Loaded",
                message : `${jsonData.Items[0].Title.S} was loaded successfully`,
                color : "green",
                icon : <Done/>
            })
        }).catch(err => {
            notification.showNotification({
                title : "Error",
                message : "An error occured while trying to load the file.",
                color : "red",
                icon : <Error/>
            })
        })
    }

    useEffect(() => {
        const cognitoUser = userpool.getCurrentUser();
        if (cognitoUser != null) {
            cognitoUser.getSession((err, session) => {
            if (err) {
                console.log(err);
            } else if (!session.isValid()) {
                console.log("Invalid session.");
            } else {
                //console.log("IdToken: " + session.getIdToken().getJwtToken());
                setToken(session.getIdToken().getJwtToken());
            }
            });
        } else {
            console.log("User not found.");
        }
    }, [])

    function save(){
        notification.showNotification({
            id : 'saving',
            title: "Saving",
            message : "Saving your data, please wait.",
            color: 'yellow',
            loading : true,
            icon : <Done/>
        })
        
        fetch(`https://o3145qgy04.execute-api.us-east-1.amazonaws.com/beta/notes`,{
            method: "PUT",
            headers: {Authorization : token, "Content-Type" : "application/json"},
            body: JSON.stringify({
                id : currentlyEdditing,
                content : content
            })
        })
        .then(data => {
            return data.json()
        }).then(jsonData => {
            //console.log(jsonData)
            //setContent(jsonData)
            notification.hideNotification('saving');
            notification.showNotification({
                title : "Saved",
                message : "You data has been saved successfully.",
                color: 'green',
                loading : false,
                icon : <Done/>
            })
            
        }).catch(err => {
            notification.showNotification({
                title: "Error",
                message : "An error occured while trying to save your data, please try again.",
                color: 'red',
                icon : <Error/>
            })
        })
    }

    return(
        <Group style={hidden ? {display : "none"}  : {}} noWrap>
            <NestedNav loadNoteHanlder={getContent}></NestedNav>
            <Affix position={{ bottom: 20, right: 20 }} >
                <ActionIcon onClick={save} radius={100} size={50} color={'blue'} variant="filled"><Save/></ActionIcon>
                
            </Affix>
            <RichTextEditor value={content} onChange={setContent} style={{height: "95vh", borderTop: "None", borderBottom: "None", borderRadius: "0px", overflow: "auto", width: "100%"}}></RichTextEditor>
        </Group>
    )
}

export default Notes;