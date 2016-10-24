import React from 'react';
import { ListItem } from 'react-toolbox/lib/list';
import { IconMenu, MenuItem, MenuDivider } from 'react-toolbox/lib/menu';

const Task = (props) => (
	<ListItem caption={props.caption}>
		<IconMenu icon='more_vert' position='topLeft' menuRipple>
			<MenuDivider />
			<MenuItem value='delete' icon='delete' caption='Delete'
				onClick={(e) => props.delete(props.index)}
			/>
		</IconMenu>
	</ListItem>
);

export default Task;