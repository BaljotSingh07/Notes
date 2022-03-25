import {Navbar, ScrollArea, ActionIcon, Popover, Center, Group, Divider } from '@mantine/core'
import {LightMode, MenuBook, Logout, CalendarToday, Calculate} from '@mui/icons-material'
import { useContext, useState } from 'react';
import userpool from '../userpool';
import {UserContext} from '../App'

function PopoverButtons({icon, tooltip, transition, pageHandler}){
    const [opened, setOpened] = useState();

    return(
        <Popover
            opened={opened}
            onClose={() => setOpened(false)}
            position='right'
            transition= {transition}
            noFocusTrap
            noEscape
            target={
                <ActionIcon onMouseEnter={() => setOpened(true)} onClick={() => {pageHandler(tooltip)}} onMouseLeave={() => setOpened(false)}>
                {icon}
                </ActionIcon>
                
              }
        >
        <Center style={{height: "5px"}}>{tooltip}</Center>
        </Popover>
    )
}


function MyNavbar({pageHandler}) {
  const user = useContext(UserContext);
  

  return (
    <Navbar padding="xs" height={"98vh"} width={{ base: 50 }}>
        <Navbar.Section><PopoverButtons transition='slide-down' tooltip='Go Light' icon={<LightMode/>}/></Navbar.Section>

        <Divider />

        <Navbar.Section grow mt={"xl"} component={ScrollArea}>
          <Group spacing={"xl"}>
            <PopoverButtons pageHandler={pageHandler} transition='slide-left' tooltip='Notes' icon={<MenuBook/>}/>
            <PopoverButtons pageHandler={pageHandler} transition='slide-left' tooltip='Calendar' icon={<CalendarToday/>}/>
            <PopoverButtons pageHandler={pageHandler} transition='slide-left' tooltip='Calculator' icon={<Calculate/>}/>
          </Group>
        </Navbar.Section>

        <Navbar.Section><ActionIcon onClick={() => {userpool.getCurrentUser().signOut(); user.updateUser()}} ><Logout/></ActionIcon></Navbar.Section>
    </Navbar>
  );
}

export default MyNavbar;
