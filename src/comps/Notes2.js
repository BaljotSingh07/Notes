import { Navbar, Accordion, Title, TextInput, Button, ThemeIcon, ScrollArea, Text,Input, Popover, Group} from '@mantine/core';
import { RichTextEditor } from '@mantine/rte';
import {useInputState, useClickOutside} from '@mantine/hooks'
import {CreateNewFolder, FolderOpen, Done} from '@mui/icons-material'
import { useState} from 'react';

function FolderLabel({name, handler}){
    const [folderName, setFolderName] = useInputState(name);
    const [editName, setEditName] = useState(false);
    const outsideRef = useClickOutside(() => {setEditName(false); handler(false)})

    return(
        <>
        {editName ? <Input ref={outsideRef} value={folderName} onChange={setFolderName}></Input> : <Text onDoubleClick={()=>{setEditName(!editName); handler(true)}}>{folderName}</Text>}
        </>
    )
}

function NestedNav(){
    const [editing, setEdditing] = useState(false);
    const [accordionState, setAccordionState] = useState([]);
    const [newFolder, setNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useInputState("");
    const [data, setData] = useState([
        {
            Name: "CS 422",
            Sections: ["Breath-First Search","Depth-First Search", "Informed Searches"],
        },
        {
            Name: "CS 458",
            Sections: ["Cache","SICS VS RISC"]
        }
    ]);

    function createFolder(e){
        setData([...data, {Name : newFolderName, Sections : [""]}])
        e.preventDefault();
        setNewFolder(false);
    }

    return(
        <Navbar padding={"md"} height={"95vh"}  width={{ base: 250}}>
            <Navbar.Section mb={"lg"}><Title align='center' order={3}>Choose Notes</Title ></Navbar.Section>
            <Navbar.Section mb={"lg"}><TextInput placeholder='Search Notes'></TextInput></Navbar.Section>

            <Navbar.Section grow component={ScrollArea}>
                <Accordion state={editing ? [] : accordionState } offsetIcon={false} disableIconRotation>
               {data.map((e,i)=>{
                    return(
                        <Accordion.Item onClick={() => {setAccordionState([].push(i+1))}} key={i} icon={<ThemeIcon  variant="light" color={"orange"} size={'md'}><FolderOpen/></ThemeIcon>} label={<FolderLabel handler={(set) => {setEdditing(set)}} name={e.Name} />}>
                            {e.Sections.map((x) => {
                                return <Accordion.Item iconPosition='right' iconSize={0} icon={<></>} label={x}></Accordion.Item>
                            })}
                        </Accordion.Item>
                    )
               })}
                </Accordion>
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