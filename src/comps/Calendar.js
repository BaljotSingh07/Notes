import {Group} from '@mantine/core'

function Calendar({hidden}){
    return(
        <Group style={hidden ? {display : "none"}  : {}} noWrap>

        </Group>
    )
}

export default Calendar;