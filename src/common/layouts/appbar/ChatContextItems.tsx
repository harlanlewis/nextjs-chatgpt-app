import * as React from 'react';

import { ListItemDecorator, MenuItem } from '@mui/joy';
import RuleIcon from '@mui/icons-material/Rule';
import DeleteIcon from '@mui/icons-material/Delete';

import { useApplicationBarStore } from '~/common/layouts/appbar/store-applicationbar';


export function ChatContextItems(props: {
  conversationId: string | null, isConversationEmpty: boolean,
  isMessageSelectionMode: boolean, setIsMessageSelectionMode: (isMessageSelectionMode: boolean) => void,
  onClearConversation: (conversationId: string) => void,
}) {

  const closeContextMenu = () => useApplicationBarStore.getState().setContextMenuAnchor(null);

  const handleToggleMessageSelectionMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeContextMenu();
    props.setIsMessageSelectionMode(!props.isMessageSelectionMode);
  };

  const handleConversationClear = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    props.conversationId && props.onClearConversation(props.conversationId);
  };

  const disabled = !props.conversationId || props.isConversationEmpty;

  return <>

    <MenuItem disabled={disabled} onClick={handleToggleMessageSelectionMode}>
      <ListItemDecorator><RuleIcon /></ListItemDecorator>
      {props.isMessageSelectionMode ? 'Done pruning' : 'Prune messages' }
    </MenuItem>

    <MenuItem disabled={disabled} onClick={handleConversationClear}>
    <ListItemDecorator><DeleteIcon /></ListItemDecorator>
      Delete conversation
    </MenuItem>

  </>;
}