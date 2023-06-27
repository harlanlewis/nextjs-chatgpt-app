import { shallow } from 'zustand/shallow';

import { Avatar, Box, IconButton, ListItemDecorator, MenuItem, Typography } from '@mui/joy';

import { DConversation, useChatStore } from '~/common/state/store-chats';
import { SystemPurposes } from '../../../../data';


const DEBUG_CONVERSATION_IDs = false;


const conversationTitle = (conversation: DConversation): string =>
  conversation.userTitle || conversation.autoTitle || 'new conversation'; // 👋💬🗨️


export function ConversationItem(props: {
  conversationId: string,
  isActive: boolean, isSingle: boolean, showSymbols: boolean,
  conversationActivate: (conversationId: string) => void,
  conversationDelete: (conversationId: string) => void,
}) {

  // bind to conversation
  const cState = useChatStore(state => {
    const conversation = state.conversations.find(conversation => conversation.id === props.conversationId);
    return conversation && {
      isNew: conversation.messages.length === 0,
      assistantTyping: !!conversation.abortController,
      systemPurposeId: conversation.systemPurposeId,
      title: conversationTitle(conversation),
      setUserTitle: state.setUserTitle,
    };
  }, shallow);

  // sanity check: shouldn't happen, but just in case
  if (!cState) return null;
  const { isNew, assistantTyping, systemPurposeId, title } = cState;

  const handleActivate = () => props.conversationActivate(props.conversationId);

  const textSymbol = SystemPurposes[systemPurposeId]?.symbol || '❓';

  if (isNew) return <Box display='none' />

  return (
    <MenuItem
      variant={props.isActive ? 'solid' : 'plain'} color='neutral'
      selected={props.isActive}
      onClick={handleActivate}
    >

      {/* Icon */}
      {props.showSymbols && <ListItemDecorator>
        {assistantTyping ? (
          <Avatar
            alt='typing' variant='plain'
            src='https://i.giphy.com/media/jJxaUysjzO9ri/giphy.webp'
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
            }}
          />
        ) : (
          <Typography sx={{ fontSize: '18px' }}>
            {isNew ? '' : textSymbol}
          </Typography>
        )}
      </ListItemDecorator>}

      <Box sx={{ flexGrow: 1 }}>
        {DEBUG_CONVERSATION_IDs ? props.conversationId.slice(0, 10) : title}{assistantTyping && '...'}
      </Box>

    </MenuItem>
  );
}