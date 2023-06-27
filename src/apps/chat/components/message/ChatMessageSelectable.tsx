import * as React from 'react';

import { Box, Button, Checkbox, Sheet, Stack, Typography, useTheme } from '@mui/joy';
import DeleteIcon from '@mui/icons-material/Delete';

import { DMessage } from '~/common/state/store-chats';

import { TokenBadge } from '../composer/TokenBadge';
import { makeAvatar, messageBackground } from './ChatMessage';


/**
 * Header bar for controlling the operations during the Selection mode
 */
export const MessagesSelectionHeader = (props: { hasSelected: boolean, sumTokens: number, onClose: () => void, onSelectAll: (selected: boolean) => void, onDeleteMessages: () => void }) =>
  <Sheet color='warning' variant='solid' invertedColors sx={{
    display: 'flex', flexDirection: 'row', alignItems: 'center',
    gap: { xs: 1, sm: 2 }, 
    px: { xs: 2, md: 4, xl: 6 },
    py: 1,
  }}>
    <Checkbox 
      size='md' 
      label={`Select all (${props.sumTokens} tokens)`}
      onChange={event => props.onSelectAll(event.target.checked)} 
      sx={{ minWidth: 24, justifyContent: 'center' }} 
    />

    <Stack direction='row' justifyContent='flex-end' gap={1} flexGrow={1}>
      <Button size='sm' variant='solid' color={props.hasSelected ? 'danger' : 'warning'} disabled={!props.hasSelected} onClick={props.onDeleteMessages} startDecorator={<DeleteIcon />}>
        Prune
      </Button>

      <Button size='sm' variant='solid' onClick={props.onClose}>
        Done pruning
      </Button>
    </Stack>
  </Sheet>;


/**
 * Small representation of a ChatMessage, used when in selection mode
 *
 * Shall look similarly to the main ChatMessage, for consistency, but just allow a simple checkbox selection
 */
export function ChatMessageSelectable(props: { message: DMessage, isBottom: boolean, selected: boolean, remainingTokens: number, onToggleSelected: (messageId: string, selected: boolean) => void }) {
  // external state
  const theme = useTheme();

  const {
    id: messageId,
    text: messageText,
    sender: messageSender,
    avatar: messageAvatar,
    typing: messageTyping,
    role: messageRole,
    purposeId: messagePurposeId,
    originLLM: messageOriginLLM,
    tokenCount: messageTokenCount,
    updated: messageUpdated,
  } = props.message;

  const fromAssistant = messageRole === 'assistant';

  const isAssistantError = fromAssistant && (messageText.startsWith('[Issue] ') || messageText.startsWith('[OpenAI Issue]'));

  const background = messageBackground(theme, messageRole, !!messageUpdated, isAssistantError);

  const avatarEl: React.JSX.Element | null = React.useMemo(() =>
      makeAvatar(messageAvatar, messageRole, messageOriginLLM, messagePurposeId, messageSender, messageTyping, 'sm'),
    [messageAvatar, messageOriginLLM, messagePurposeId, messageRole, messageSender, messageTyping],
  );

  const handleCheckedChange = (event: React.ChangeEvent<HTMLInputElement>) => props.onToggleSelected(messageId, event.target.checked);

  return (
    <Stack 
      direction='row'
      alignItems='center'
      gap={{ xs: 1, sm: 2 }}
      px={{ xs: 1, md: 2 }}
      py={2}
      sx={{
        background,
        ...(props.isBottom && { mb: 'auto' }),
      }}
    >

      <Box sx={{ display: 'flex', minWidth: 24, justifyContent: 'center' }}>
        <Checkbox size='md' checked={props.selected} onChange={handleCheckedChange} />
      </Box>

      <Box sx={{ display: 'flex', minWidth: { xs: 40, sm: 48 }, justifyContent: 'center' }}>
        {avatarEl}
      </Box>

      <Typography level='body2' sx={{ minWidth: 64 }}>
        {messageRole}
      </Typography>

      <Box sx={{ display: 'flex', minWidth: { xs: 32, sm: 45 }, justifyContent: 'flex-end' }}>
        <TokenBadge directTokens={messageTokenCount} tokenLimit={props.remainingTokens} inline />
      </Box>

      <Typography level='body1' sx={{ flexGrow: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        {messageText}
      </Typography>

    </Stack>
  );
}