import { Navbar, Title, TextInput, Button, ScrollArea, Popover, Group, List, Breadcrumbs, Anchor, JsonInput} from '@mantine/core';
import { RichTextEditor } from '@mantine/rte';
import {useInputState, useLocalStorageValue} from '@mantine/hooks'
import {CreateNewFolder, Folder, InsertDriveFile} from '@mui/icons-material'
import { useEffect, useRef, useState} from 'react';
import userpool from '../userpool';

function NestedNav(){
    const [newFolder, setNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useInputState("");
    const [data, setData] = useState({});
    const [currentFolder, setCurrentFolder] = useState('root');
    const [token, setToken] = useState();

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
                setToken(t);
            }
            });
        } else {
            console.log("User not found.");
        }


        fetch("https://o3145qgy04.execute-api.us-east-1.amazonaws.com/beta/folders?id=root",{
            headers: {Authorization : t} 
        })
        .then(data => {
            return data.json()
        }).then(jsonData => {
            console.log(jsonData)
            setData(jsonData)
        }).catch(err => {
            console.log(err)
        })
    },[])

    function createFolder(e){
        //setData([...data, {Name : newFolderName, Sections : [""]}])
        e.preventDefault();
        fetch("https://o3145qgy04.execute-api.us-east-1.amazonaws.com/beta/notes",{
            method : "POST",
            headers: {Authorization : token},
            body: JSON.stringify({
                "parent_id" : currentFolder,
                "type" : 'dir',
                "title" : newFolderName,
            })
        }).then(data => {
            return data.json()
        }).then(jsonData => {
            console.log(jsonData)
        }).catch(err => {
            console.log(err)
        })
        setNewFolder(false);
    }

    return(
        <Navbar padding={"md"} height={"95vh"}  width={{ base: 250}}>
            <Navbar.Section mb={"lg"}><Title align='center' order={3}>Choose Notes</Title ></Navbar.Section>
            <Navbar.Section mb={"lg"}><TextInput placeholder='Search Notes'></TextInput></Navbar.Section>
            <Navbar.Section mb={'lg'}>
            <Breadcrumbs styles={{separator : {marginRight : "4px"}}}>
              
            </Breadcrumbs>
            </Navbar.Section>
            <Navbar.Section grow component={ScrollArea}>
                <List spacing={5}>
               {/* {getPathChildren(path,data).Children.map((e,i)=>{
                    return(
                        <List.Item  onClick={e.Type === 'dir' ? () => {setPath([...path,i])} : () => {}} sx={(theme) => ({'&:hover': {backgroundColor: theme.colors.gray[1],cursor : "pointer"},})} 
                        icon={e.Type === "dir" ? <Folder/> : <InsertDriveFile/>}>{e.Name}</List.Item>
                    )
               })} */}
                </List>

                </Navbar.Section>

            <Navbar.Section>
            <Popover style={{width: "100%"}} spacing={0} transition="slide-up" position='top' opened={newFolder} onClose={() => {setNewFolder(false)}} target={<Button leftIcon={<CreateNewFolder/>} fullWidth color={'orange'} onClick={() =>{setNewFolder(!newFolder)}}>New Folder</Button>}>
               <form style={{minWidth: "300px"}} onSubmit={(e) => {createFolder(e)}}>
                    <TextInput onChange={setNewFolderName}></TextInput>
               </form>
            </Popover>
            </Navbar.Section>
            
        </Navbar>
    )
}

function Notes({hidden}){
    return(
        <Group style={hidden ? {display : "none"}  : {}} noWrap>
            <NestedNav></NestedNav>
            <RichTextEditor style={{height: "95vh", borderTop: "None", borderBottom: "None", borderRadius: "0px", overflow: "auto", width: "100%"}}></RichTextEditor>
        </Group>
    )
}

export default Notes;