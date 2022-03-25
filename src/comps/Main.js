import { Container, AppShell } from "@mantine/core";
import { useState } from "react";
import Sidebar from "./sidebar";
import Notes from "./Notes";
import Calender from "./Calendar"

function Main() {
  const [showing, setShowing] = useState("Notes");

  return (
    <AppShell navbar={<Sidebar pageHandler={(page) => {setShowing(page)}} />}>

      <Notes hidden={showing === "Notes" ? false : true}/>
      <Calender hidden={showing === "Calendar" ? false : true}/>
      
    </AppShell>
  );
}

export default Main;
