import * as React from 'react';

import { ListItemDecorator, MenuItem, Switch } from '@mui/joy';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { downloadConversationJson, useChatStore } from '~/common/state/store-chats';
import { useApplicationBarStore } from '~/common/layouts/appbar/store-applicationbar';


export function ChatShareItems(props: {
  conversationId: string | null, isConversationEmpty: boolean,
  onPublishConversation: (conversationId: string) => void
}) {

  const closeShareMenu = () => useApplicationBarStore.getState().setShareMenuAnchor(null);

  const handleConversationPublish = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    props.conversationId && props.onPublishConversation(props.conversationId);
  };

  const handleConversationDownload = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const conversation = useChatStore.getState().conversations.find(conversation => conversation.id === props.conversationId);
    if (conversation)
      downloadConversationJson(conversation);
  };

  const disabled = !props.conversationId || props.isConversationEmpty;

  return <>

    <MenuItem disabled={disabled} onClick={handleConversationPublish}>
      <ListItemDecorator>
        <ExitToAppIcon />
      </ListItemDecorator>
      Share on paste.gg
    </MenuItem>

    <MenuItem disabled={disabled} onClick={handleConversationDownload}>
      <ListItemDecorator>
        <FileDownloadIcon />
      </ListItemDecorator>
      Export conversation (JSON)
    </MenuItem>

  </>;
}