import * as React from 'react';
import { shallow } from 'zustand/shallow';

import { Alert } from '@mui/joy';

import { MAX_CONVERSATIONS, useChatStore } from '~/common/state/store-chats';
import { useUIPreferencesStore } from '~/common/state/store-ui';

import { ConversationItem } from './ConversationItemNew';


export function ConversationItems(props: {
  conversationId: string | null,
  editConversations: boolean,
}) {

  // external state
  const conversationIDs = useChatStore(state => state.conversations.map(
    conversation => conversation.id,
  ), shallow);
  const { setActiveConversationId, deleteConversation } = useChatStore(state => ({
    topNewConversationId: state.conversations.length ? state.conversations[0].messages.length === 0 ? state.conversations[0].id : null : null,
    setActiveConversationId: state.setActiveConversationId,
    createConversation: state.createConversation,
    deleteConversation: state.deleteConversation,
  }), shallow);
  const { showSymbols } = useUIPreferencesStore(state => ({
    showSymbols: state.zenMode !== 'cleaner',
  }), shallow);

  const singleChat = conversationIDs.length === 1;
  const maxReached = conversationIDs.length >= MAX_CONVERSATIONS;

  const handleConversationActivate = React.useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, [setActiveConversationId]);

  const handleConversationDelete = React.useCallback((conversationId: string) => {
    if (!singleChat && conversationId)
      deleteConversation(conversationId);
  }, [deleteConversation, singleChat]);

  return <>

    { maxReached &&
      <Alert variant="soft" color="warning">
        Reached conversation limit. Starting a new conversation will delete the oldest.
      </Alert>
    }

    {conversationIDs.map(conversationId =>
      <ConversationItem
        key={'c-id-' + conversationId}
        conversationId={conversationId}
        editConversations={props.editConversations}
        isSingle={singleChat}
        showSymbols={showSymbols}
        conversationActivate={handleConversationActivate}
        conversationDelete={handleConversationDelete}
      />)}

  </>;
}