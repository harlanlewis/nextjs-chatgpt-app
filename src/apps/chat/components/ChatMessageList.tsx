import * as React from 'react';
import { shallow } from 'zustand/shallow';

import { Box, Button, Stack, Typography } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';

import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

import { useChatLLM } from '~/modules/llms/store-llms';

import { createDMessage, DMessage, useChatStore } from '~/common/state/store-chats';
import { useUIPreferencesStore } from '~/common/state/store-ui';

import { ChatMessage } from './message/ChatMessage';
import { ChatMessageSelectable, MessagesSelectionHeader } from './message/ChatMessageSelectable';
import { PurposeSelector } from './purpose-selector/PurposeSelector';
import { SendModeId } from '../Chat';


/**
 * A list of ChatMessages
 */
export function ChatMessageList(props: {
  conversationId: string | null,
  isMessageSelectionMode: boolean, setIsMessageSelectionMode: (isMessageSelectionMode: boolean) => void,
  onExecuteConversation: (sendModeId: SendModeId, conversationId: string, history: DMessage[]) => void,
  onImagineFromText: (conversationId: string, userText: string) => void,
  sx?: SxProps
}) {
  // state
  const [selectedMessages, setSelectedMessages] = React.useState<Set<string>>(new Set());

  // external state
  const { showSystemMessages, setShowSystemMessages } = useUIPreferencesStore(state => ({
    showSystemMessages: state.showSystemMessages, setShowSystemMessages: state.setShowSystemMessages,
  }), shallow);
  const { messages, editMessage, deleteMessage, historyTokenCount } = useChatStore(state => {
    const conversation = state.conversations.find(conversation => conversation.id === props.conversationId);
    return {
      messages: conversation ? conversation.messages : [],
      editMessage: state.editMessage, deleteMessage: state.deleteMessage,
      historyTokenCount: conversation ? conversation.tokenCount : 0,
    };
  }, shallow);
  const { chatLLM } = useChatLLM();

  const handleSystemMessagesToggle = () => setShowSystemMessages(!showSystemMessages);

  const handleMessageDelete = (messageId: string) =>
    props.conversationId && deleteMessage(props.conversationId, messageId);

  const handleMessageEdit = (messageId: string, newText: string) =>
    props.conversationId && editMessage(props.conversationId, messageId, { text: newText }, true);

  const handleImagineFromText = (messageText: string) =>
    props.conversationId && props.onImagineFromText(props.conversationId, messageText);

  const handleRestartFromMessage = (messageId: string, offset: number) => {
    const truncatedHistory = messages.slice(0, messages.findIndex(m => m.id === messageId) + offset + 1);
    props.conversationId && props.onExecuteConversation('immediate', props.conversationId, truncatedHistory);
  };

  const handleRunExample = (text: string) =>
    props.conversationId && props.onExecuteConversation('immediate', props.conversationId, [...messages, createDMessage('user', text)]);


  // hide system messages if the user chooses so
  // NOTE: reverse is because we'll use flexDirection: 'column-reverse' to auto-snap-to-bottom
  const filteredMessages = messages.filter(m => m.role !== 'system' || showSystemMessages).reverse();

  // when there are no messages, show the purpose selector
  if (!filteredMessages.length)
    return props.conversationId ? (
      <Box sx={props.sx || {}}>
        <PurposeSelector conversationId={props.conversationId} runExample={handleRunExample} />
      </Box>
    ) : null;


  const handleToggleSelected = (messageId: string, selected: boolean) => {
    const newSelected = new Set(selectedMessages);
    selected ? newSelected.add(messageId) : newSelected.delete(messageId);
    setSelectedMessages(newSelected);
  };

  const handleSelectAllMessages = (selected: boolean) => {
    const newSelected = new Set<string>();
    if (selected)
      for (const message of messages)
        newSelected.add(message.id);
    setSelectedMessages(newSelected);
  };

  const handleDeleteSelectedMessages = () => {
    if (props.conversationId)
      for (const selectedMessage of selectedMessages)
        deleteMessage(props.conversationId, selectedMessage);
    setSelectedMessages(new Set());
  };

  const buttonToggleSystemPrompt = () => {
    return (
      <Button
        onClick={handleSystemMessagesToggle}
        size='sm' 
        color={showSystemMessages ? 'primary' : 'neutral'}
        variant={showSystemMessages ? 'solid' : 'outlined' }
        startDecorator={<SettingsSuggestIcon />}
      >
        {showSystemMessages ? 'Hide' : 'Show'} system prompt
      </Button>
    )
  }

  return (<>
    <Stack 
      direction='column-reverse' // chat messages scroll from bottom. `.reverse()` on the map doesn't scroll as new messages come in
      gap={0}
      pb={4}
      px={{ xs: 1, md: 2, xl: 4 }}
      sx={{ 
        ...(props.sx || {}),
      }}
    >

      {filteredMessages.map((message, idx) =>
        props.isMessageSelectionMode ? (

          <ChatMessageSelectable
            key={'sel-' + message.id} message={message}
            isBottom={idx === 0} remainingTokens={(chatLLM ? chatLLM.contextTokens : 0) - historyTokenCount}
            selected={selectedMessages.has(message.id)} onToggleSelected={handleToggleSelected}
          />

        ) : (

          <ChatMessage
            key={'msg-' + message.id} message={message}
            buttonToggleSystemPrompt={buttonToggleSystemPrompt}
            isBottom={idx === 0}
            onMessageDelete={() => handleMessageDelete(message.id)}
            onMessageEdit={newText => handleMessageEdit(message.id, newText)}
            onMessageRunFrom={(offset: number) => handleRestartFromMessage(message.id, offset)}
            onImagine={handleImagineFromText}
          />

        ),
      )}

      { !showSystemMessages && <Box flexGrow={0}>{buttonToggleSystemPrompt()}</Box> }
      <Box pb={10}></Box> {/* space to scroll under ApplicationBar when viewing a message thread. Can't be paddingTop due to iOS "cleverly" collapsing with viewport edge. Must be inside the scrollable area.  */}

    </Stack>

    {props.isMessageSelectionMode && (
      <MessagesSelectionHeader
        hasSelected={selectedMessages.size > 0}
        sumTokens={historyTokenCount}
        onClose={() => props.setIsMessageSelectionMode(false)}
        onSelectAll={handleSelectAllMessages}
        onDeleteMessages={handleDeleteSelectedMessages}
      />
    )}
  </>);
}