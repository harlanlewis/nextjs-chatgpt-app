import * as React from 'react';
import { shallow } from 'zustand/shallow';

import { Box, Button, Grid, IconButton, Stack, useTheme } from '@mui/joy';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';

import { DConversation, useChatStore } from '~/common/state/store-chats';
import { InlineTextarea } from '~/common/components/InlineTextarea';
import { SystemPurposes } from '../../../../data';


const DEBUG_CONVERSATION_IDs = false;


const conversationTitle = (conversation: DConversation): string =>
  conversation.userTitle || conversation.autoTitle || 'new conversation'; // 👋💬🗨️


export function ConversationItem(props: {
  conversationId: string,
  editConversations: boolean,
  isSingle: boolean, 
  showSymbols: boolean,
  conversationActivate: (conversationId: string) => void,
  conversationDelete: (conversationId: string) => void,
}) {

  // state
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  
  // exernal state
  const theme = useTheme();
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
  const { isNew, assistantTyping, setUserTitle, systemPurposeId, title } = cState;

  const handleActivate = () => props.conversationActivate(props.conversationId);

  const handleEditBegin = () => setIsEditingTitle(true);

  const handleEdited = (text: string) => {
    setIsEditingTitle(false);
    setUserTitle(props.conversationId, text);
  };

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    props.conversationDelete(props.conversationId);
  };

  const textSymbol = SystemPurposes[systemPurposeId]?.symbol || '❓';

  if (isNew) return <Box display='none' />

  return (
    <Stack 
      direction='row' 
      alignItems='center' 
      spacing={1}
      sx={{
        ...(props.editConversations && !isEditingTitle && {
          borderRadius: 'var(--joy-radius-sm)',
          background: theme.vars.palette.background.level1,
        })
      }}
    >
      <Button
        variant={ props.editConversations ? 'plain' : 'soft' }
        color='neutral'
        onClick={!isEditingTitle ? handleActivate : undefined}
        size='sm'
        sx={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
        }}
      >
        <Box pr={1} fontSize='1.5rem'>
          {isNew ? '' : textSymbol}
        </Box>
        { !isEditingTitle ?
          <Box sx={{ flexGrow: 1, textAlign: 'start' }}>
            {DEBUG_CONVERSATION_IDs ? props.conversationId.slice(0, 10) : title}{assistantTyping && '...'}
          </Box>
        :
          <InlineTextarea initialText={title} onEdit={handleEdited} sx={{ flexGrow: 1, fontSize: '1em', textAlign: 'start' }} />
        }
      </Button>
      
      { props.editConversations && !isEditingTitle && <>
        <IconButton
          variant='plain' 
          color='neutral'
          size='sm'
          onClick={handleEditBegin}>
          <ModeEditIcon />
        </IconButton>
        <IconButton
          variant='solid' 
          color='danger'
          size='sm'
          onClick={handleDeleteConfirm}>
          <DeleteIcon />
        </IconButton>
      </>}

    </Stack>
  );
}