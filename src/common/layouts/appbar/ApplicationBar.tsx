import * as React from 'react';
import { shallow } from 'zustand/shallow';

import { Box, Button, ButtonGroup, IconButton, Menu, Stack, Typography, Tooltip } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MoreVertIcon from '@mui/icons-material/MoreVert';
// import ForumIcon from '@mui/icons-material/Forum';
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';

import { DarkModeToggle } from 'src/apps/settings/DarkModeToggle';

import { floatingButtonsSx } from '~/common/theme';
import { useChatStore } from '~/common/state/store-chats';
import { useUIStateStore } from '~/common/state/store-ui';

import { useApplicationBarStore } from './store-applicationbar';


export function ApplicationBar(props: { onLandingView: boolean, sx?: SxProps }) {
  // external state
  const {
    appMenuItems, contextMenuItems, shareMenuItems,
    appMenuAnchor: applicationMenuAnchor, setAppMenuAnchor: setApplicationMenuAnchor,
    contextMenuAnchor, setContextMenuAnchor,
    shareMenuAnchor, setShareMenuAnchor,
  } = useApplicationBarStore(state => ({
    appMenuBadge: state.appMenuBadge,
    appMenuItems: state.appMenuItems,
    contextMenuItems: state.contextMenuItems,
    shareMenuItems: state.shareMenuItems,
    appMenuAnchor: state.appMenuAnchor, setAppMenuAnchor: state.setAppMenuAnchor,
    contextMenuAnchor: state.contextMenuAnchor, setContextMenuAnchor: state.setContextMenuAnchor,
    shareMenuAnchor: state.shareMenuAnchor, setShareMenuAnchor: state.setShareMenuAnchor,
  }), shallow);

  const { activeConversationId, topNewConversationId, setActiveConversationId, createConversation } = useChatStore(state => ({
    activeConversationId: state.activeConversationId,
    topNewConversationId: state.conversations.length ? state.conversations[0].messages.length === 0 ? state.conversations[0].id : null : null,
    setActiveConversationId: state.setActiveConversationId,
    createConversation: state.createConversation,
  }), shallow);

  const handleShowSettings = () => {
    useUIStateStore.getState().openSettings();
  };

  const handleNew = React.useCallback(() => {
    // if the first in the stack is a new conversation, just activate it
    if (topNewConversationId) {
      setActiveConversationId(topNewConversationId);
    } else {
      createConversation();
    }
  }, [topNewConversationId, setActiveConversationId, createConversation]);

  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.keyCode === 27) {
        handleNew();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleNew]);

  const doneLegend = 
    <Box sx={{ p: 1, fontSize: '0.8rem' }}>
      <strong>Shortcut:</strong> ESC
    </Box>;

  const closeApplicationMenu = () => setApplicationMenuAnchor(null);
  const closeContextMenu = () => setContextMenuAnchor(null);
  const closeShareMenu = () => setShareMenuAnchor(null);

  return <>
    <Stack direction='row' justifyContent='space-between' sx={{ ...(props.sx || {}) }}>

      <Stack direction='row' alignItems='center' spacing={1} >
        { (topNewConversationId !== activeConversationId) && <>
          <Tooltip title={doneLegend} placement='top'>
            <Button size='sm' color='neutral' variant='solid' onClick={handleNew} startDecorator={<ChevronLeftIcon />} sx={{ ...floatingButtonsSx }}>
              Done
            </Button>
          </Tooltip>
          <Stack display={{ xs: 'none', md: 'flex' }} direction='row' alignItems='center' px={2} spacing={1}>
            <Box sx={{ width: '1.25rem', height: '1.25rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)'}}></Box>
            {/* <Typography level='h3'>{todo: ConversationTitle}</Typography> */}
            </Stack>
          <IconButton size='sm' color='neutral' variant='outlined' disabled={!!contextMenuAnchor || !contextMenuItems} onClick={event => setContextMenuAnchor(event.currentTarget)} sx={{ ...floatingButtonsSx }}>
            <MoreVertIcon />
          </IconButton>
          <IconButton size='sm' color='neutral' variant='outlined' disabled={!!shareMenuAnchor || !shareMenuItems} onClick={event => setShareMenuAnchor(event.currentTarget)} sx={{ ...floatingButtonsSx }}>
            <ShareIcon />
          </IconButton>
        </>}
      </Stack>

      <Stack direction='row' alignItems='center' spacing={1} >
        <DarkModeToggle />
        { props.onLandingView ? 
          <Button size='sm' color='neutral' variant='outlined' onClick={handleShowSettings} sx={{ ...floatingButtonsSx }} startDecorator={<SettingsIcon />}>
            Preferences
          </Button>
          :
          <IconButton size='sm' color='neutral' variant='outlined' onClick={handleShowSettings} sx={{ ...floatingButtonsSx }}>
            <SettingsIcon />
          </IconButton>
        }
      </Stack>
      
    </Stack>

    {/* Application-Menu Items */}
    {!!appMenuItems && <Menu
      variant='plain' color='neutral' size='lg' sx={{ minWidth: 320, maxHeight: 'calc(100dvh - 56px)', overflowY: 'auto' }}
      open={!!applicationMenuAnchor} anchorEl={applicationMenuAnchor} onClose={closeApplicationMenu}
      placement='bottom-start' disablePortal={false}
    >
      {appMenuItems}
    </Menu>}

    <Menu
      variant='plain' color='neutral' size='md' sx={{ minWidth: 280, maxHeight: 'calc(100dvh - 56px)', overflowY: 'auto' }}
      open={!!contextMenuAnchor} anchorEl={contextMenuAnchor} onClose={closeContextMenu}
      placement='bottom-end' disablePortal={false}
    >
      {contextMenuItems}
    </Menu>
    
    <Menu
      variant='plain' color='neutral' size='md' sx={{ minWidth: 280, maxHeight: 'calc(100dvh - 56px)', overflowY: 'auto' }}
      open={!!shareMenuAnchor} anchorEl={shareMenuAnchor} onClose={closeShareMenu}
      placement='bottom-end' disablePortal={false}
    >
      {shareMenuItems}
    </Menu>

  </>;
}