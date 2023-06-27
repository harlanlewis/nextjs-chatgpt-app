import * as React from 'react';
import { shallow } from 'zustand/shallow';

import { Box, Button, Grid, IconButton, Stack, Textarea, Tooltip, Typography, useTheme } from '@mui/joy';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ForumIcon from '@mui/icons-material/Forum';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

import { restoreConversationFromJson, useChatStore } from '~/common/state/store-chats';

import { SystemPurposeId, SystemPurposes } from '../../../../data';
import { usePurposeStore } from './store-purposes';

import { Brand } from '~/common/brand';
import { ConfirmationModal } from '~/common/components/ConfirmationModal';
import { ConversationItems } from '../appbar/ConversationItemsNew';
import { ImportedModal, ImportedOutcome } from '../appbar/ImportedModal';
import { checkLocalStorage } from '~/common/util/checkLocalStorage';

const favoriteTileSize = { xs: 96, sm: 116, md: 124, lg: 132, xl: 148 };
const SPECIAL_ID_ALL_CHATS = 'all-chats';

/**
 * Purpose selector for the current chat. Clicking on any item activates it for the current chat.
 */
export function PurposeSelector(props: { conversationId: string, runExample: (example: string) => void }) {
  // state
  const [editConversations, setEditConversations] = React.useState(false);
  const [showConversations, setShowConversations] = React.useState(localStorage.getItem('showConversations') === 'true');
  const [editFavorites, setEditFavorites] = React.useState(false);
  const [showFavorites, setShowFavorites] = React.useState(checkLocalStorage('showFavorites') ? (localStorage.getItem('showFavorites') === 'true') : true);
  const [showPrompts, setShowPrompts] = React.useState(localStorage.getItem('showPrompts') === 'true');
  const [deleteConfirmationId, setDeleteConfirmationId] = React.useState<string | null>(null);
  const conversationFileInputRef = React.useRef<HTMLInputElement>(null);
  const [conversationImportOutcome, setConversationImportOutcome] = React.useState<ImportedOutcome | null>(null);

  // external state
  const theme = useTheme();
  const { activeConversationId, importConversation, systemPurposeId, setSystemPurposeId, deleteAllConversations } = useChatStore(state => {
    const conversation = state.conversations.find(conversation => conversation.id === props.conversationId);
    return {
      activeConversationId: state.activeConversationId,
      deleteAllConversations: state.deleteAllConversations,
      importConversation: state.importConversation,
      systemPurposeId: conversation ? conversation.systemPurposeId : null,
      setSystemPurposeId: conversation ? state.setSystemPurposeId : null,
    };
  }, shallow);
  const conversationIDs = useChatStore(state => state.conversations.map(
    conversation => conversation.id,
  ), shallow);
  const { favoritePurposeIDs, toggleFavoritePurposeId } = usePurposeStore(state => ({ 
    favoritePurposeIDs: state.favoritePurposeIDs, toggleFavoritePurposeId: state.toggleFavoritePurposeId 
  }), shallow);

  // safety check - shouldn't happen
  if (!systemPurposeId || !setSystemPurposeId) return null;

  const toggleState = (stateVariable: boolean, updateFunction: (mode: boolean) => void, localStorageKey: string) => {
    const updatedMode = !stateVariable;
    updateFunction(updatedMode);
    localStorage.setItem(localStorageKey, updatedMode.toString());
  };
  
  const toggleEditConversations = () => {
    if (!editConversations) setShowPrompts(true);
    setEditConversations(!editConversations);
  };
  
  const toggleEditFavorites = () => {
    if (!editFavorites) setShowPrompts(true);
    setEditFavorites(!editFavorites);
  };

  const toggleShowConversations = () => toggleState(showConversations, setShowConversations, 'showConversations');
  const toggleShowFavorites = () => toggleState(showFavorites, setShowFavorites, 'showFavorites');
  const toggleShowPrompts = () => toggleState(showPrompts, setShowPrompts, 'showPrompts');

  const handlePurposeChanged = (purposeId: SystemPurposeId | null) => {
    if (purposeId)
      setSystemPurposeId(props.conversationId, purposeId);
      if (purposeId === 'Custom') {
        toggleState(false, setShowPrompts, 'showPrompts');
      }
  };

  const handleCustomSystemMessageChange = (v: React.ChangeEvent<HTMLTextAreaElement>): void => {
    // TODO: persist this change? Right now it's reset every time.
    //       maybe we shall have a "save" button just save on a state to persist between sessions
    SystemPurposes['Custom'].systemMessage = v.target.value;
  };

  const allPurposeIDs = Object.keys(SystemPurposes);
  // const unfavoritePurposeIDs = allPurposeIDs.filter(id => !favoritePurposeIDs.includes(id));

  const handleImportConversation = () => conversationFileInputRef.current?.click();

  const handleImportConversationFromFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files;
    if (!files || files.length < 1)
      return;

    // try to restore conversations from the selected files
    const outcomes: ImportedOutcome = { conversations: [] };
    for (const file of files) {
      const fileName = file.name || 'unknown file';
      try {
        const conversation = restoreConversationFromJson(await file.text());
        if (conversation) {
          importConversation(conversation);
          outcomes.conversations.push({ fileName, success: true, conversationId: conversation.id });
        } else {
          const fileDesc = `(${file.type}) ${file.size.toLocaleString()} bytes`;
          outcomes.conversations.push({ fileName, success: false, error: `Invalid file: ${fileDesc}` });
        }
      } catch (error) {
        console.error(error);
        outcomes.conversations.push({ fileName, success: false, error: (error as any)?.message || error?.toString() || 'unknown error' });
      }
    }

    // show the outcome of the import
    setConversationImportOutcome(outcomes);

    // this is needed to allow the same file to be selected again
    e.target.value = '';
  };

  const handleDeleteAllConversations = () => setDeleteConfirmationId(SPECIAL_ID_ALL_CHATS);

  const handleConfirmedDeleteConversation = () => {
    if (deleteConfirmationId) {
      if (deleteConfirmationId === SPECIAL_ID_ALL_CHATS) {
        deleteAllConversations();
      }// else
      //  deleteConversation(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const isPurposeActive = (spId: string) => { return systemPurposeId === spId }
  const isPurposeCustom = (spId: string) => { return SystemPurposes[spId as SystemPurposeId]?.title === 'Custom Prompt' }
  const isPurposeHighlighted = (spId: string) => { return SystemPurposes[spId as SystemPurposeId]?.highlighted }

  const responsiveLayoutSwitch = {
    flexDirection: { xs: 'column', md: showConversations ? 'row' : 'column' },
    conversations: {
      flexShrink: { md: showConversations ? 0 : 1 },
      flexBasis: { md: showConversations ? '33%' : undefined },
      minWidth: { md: showConversations ? '300px' : undefined },
      maxWidth: { md: showConversations ? '440px' : undefined },
    },
  };

  return <>

    {/* Conversations: Delete All */}
    <ConfirmationModal
      open={!!deleteConfirmationId} 
      onClose={() => setDeleteConfirmationId(null)} 
      onPositive={handleConfirmedDeleteConversation}
      confirmationText='Are you sure you want to delete all conversations? This cannot be undone.'
      positiveActionText='Yes, delete all'
      titleText='Delete all conversations'
    />
    
    {/* Conversations: Import */}
    <input type='file' multiple hidden accept='.json' ref={conversationFileInputRef} onChange={handleImportConversationFromFiles} />
    {!!conversationImportOutcome && (
      <ImportedModal open outcome={conversationImportOutcome} onClose={() => setConversationImportOutcome(null)} />
    )}

    <Typography level='h1' component='h1' px={2} py={2}>{Brand.Meta.Title}</Typography>

    <Stack 
      alignItems='stretch'
      justifyContent='stretch'
      py={3}
      sx={{
        flexDirection: { ...responsiveLayoutSwitch.flexDirection },
      }}
    >

      {/* CONVERSATIONS */}

      { conversationIDs.length > 0 &&
        <Stack 
          direction='column' 
          px={2}
          mb={showConversations ? 8 : 0}
          sx={{ 
            flexGrow: 1,
            ...responsiveLayoutSwitch.conversations 
          }}
        >
          <Stack 
            direction='row' 
            alignItems='center' 
            justifyContent='space-between' 
            mb={1} 
            pb={1}
            sx={{ borderBottom: `1px solid ${theme.vars.palette.neutral[200]}` }}
          >
            <Button 
              onClick={toggleShowConversations} 
              color='neutral'
              size='sm' 
              variant='plain'
              startDecorator={<ForumIcon />}
              endDecorator={showConversations ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            >
              <Typography level='h2' component='h2'>Recents</Typography>
            </Button>
            { showConversations &&
              <Stack direction='row' spacing={1}>
                { showConversations &&
                  <IconButton
                    variant='outlined'
                    color='neutral'
                    size='sm'
                    onClick={handleImportConversation}
                  >
                    <FileUploadIcon />
                  </IconButton>
                }
                { showConversations && conversationIDs.length > 1 && <>
                  { editConversations &&
                    <Button onClick={handleDeleteAllConversations} color='danger' size='sm' startDecorator={<DeleteOutlineIcon/>} variant='outlined'>
                      All
                    </Button>
                  }
                </>}
                { showConversations && conversationIDs.length > 1 &&
                  <Button disabled={conversationIDs.length <= 1} onClick={toggleEditConversations} color='neutral' size='sm' variant={editConversations ? 'solid' : 'outlined'}>
                    { editConversations && conversationIDs.length > 1 ? 'Done' : 'Edit' }
                  </Button>
                }
              </Stack>
            }
          </Stack>
          { showConversations && <>
            { conversationIDs.length <= 1 && <Typography level='body2' px={2} py={1}>No recent conversations.</Typography> }
            { conversationIDs.length > 1 && 
              <Stack
                direction='column' 
                spacing={1}
              >
                <ConversationItems
                  conversationId={activeConversationId}
                  editConversations={editConversations}
                />
              </Stack>
            }
          </>}
        </Stack>
      }

      <Stack 
        direction='column'
        alignItems='stretch'
        flexGrow={1}
      >

        {/* FAVORITES */}

        <Stack 
          direction='column' 
          mb={showFavorites ? 8 : 0}
          px={2} 
          alignItems='stretch'
        >
          <Stack direction='row' 
            alignItems='center' 
            justifyContent='space-between' 
            mb={1} 
            pb={1}
            sx={{ borderBottom: `1px solid ${theme.vars.palette.neutral[200]}` }}
          >
            <Button 
              onClick={toggleShowFavorites} 
              color='neutral' 
              size='sm' 
              variant='plain'
              startDecorator={<StarIcon />}
              endDecorator={showFavorites ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            >
              <Typography level='h2' component='h2'>Starred Prompts</Typography>
            </Button>
            <Stack direction='row' spacing={1}>
              { showFavorites &&
                <Button onClick={toggleEditFavorites} color='neutral' size='sm' variant={editFavorites ? 'solid' : 'outlined'}>
                  { editFavorites ? 'Done' : 'Select' }
                </Button>
              }
            </Stack>
          </Stack>
          { showFavorites && <>
            { favoritePurposeIDs.length < 1 && <Typography level='body2' px={2} py={1}>No favorites.</Typography> }
            <Box
              display='grid' 
              gridTemplateColumns={{
                xs: `repeat(auto-fill, minmax(${favoriteTileSize.xs}px, 1fr))`, 
                sm: `repeat(auto-fill, minmax(${favoriteTileSize.sm}px, 1fr))`, 
                md: `repeat(auto-fill, minmax(${favoriteTileSize.md}px, 1fr))`, 
                lg: `repeat(auto-fill, minmax(${favoriteTileSize.lg}px, 1fr))`, 
                xl: `repeat(auto-fill, minmax(${favoriteTileSize.xl}px, 1fr))`
              }}
              px={{ xs: 1, md: 2, xl: 4 }}
              py={{ xs: 1, md: 2, xl: 4 }}
              sx={{
                columnGap: {xs: 1, sm: 2, md: 3, lg: 4},
                rowGap: {xs: 4, sm: 5, md: 6, lg: 7, xl: 8},
              }}
            >
              {favoritePurposeIDs.sort().map((spId) => (
                <Grid key={spId} 
                  gridRow={ isPurposeHighlighted(spId) ? '1' : undefined }
                  gridColumn={ isPurposeHighlighted(spId) ? 'span 2' : undefined }
                >
                  <Box
                    position='relative' // sets context for positioning internal 'absolute' elements
                    textAlign='center'
                  >
                    <Tooltip title={SystemPurposes[spId as SystemPurposeId]?.description} placement='top'>
                      <Button
                        variant={isPurposeActive(spId) ? 'solid' : 'soft'}
                        color={isPurposeActive(spId) ? 'primary' : 'neutral'}
                        onClick={() => handlePurposeChanged(spId as SystemPurposeId)}
                        sx={{
                          flexDirection: 'column',
                          fontSize: {xs: '0.85rem', md: '1rem'},
                          position: 'relative', // sets context for positioning internal 'absolute' elements
                          height: favoriteTileSize,
                          width: '100%',
                          ...((systemPurposeId !== spId) ? {
                            boxShadow: theme.shadow.md,
                            background: theme.vars.palette.background.level1,
                          } : {}),
                          transition: 'background 0.3s ease-out'
                        }}
                      >
                        <Box 
                          fontSize={ isPurposeActive(spId) ? '5.5em' : '4em' }
                          sx={{ 
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-55%)',
                            transition: 'font-size 0.15s ease-out'
                          }}
                        >
                          {SystemPurposes[spId as SystemPurposeId]?.symbol}
                        </Box>
                        <Box 
                          color={theme.vars.palette.text.primary}
                          fontWeight={isPurposeActive(spId) ? 700 : 500}
                          position='absolute'
                          left={0}
                          right={0}
                          top={{ xs: 'calc(100% + 0.5em)', md: 'calc(100% + 0.75em)' }}
                          zIndex={2}
                          width='100%'
                          overflow='visible'
                          textAlign='center'
                          whiteSpace='nowrap'
                        >
                          {SystemPurposes[spId as SystemPurposeId]?.title}
                        </Box>
                      </Button>
                    </Tooltip>
                    { editFavorites &&
                      <Box
                        position='absolute'
                        right='0.25em'
                        top='0.25em'
                      >
                        <IconButton
                          color='warning'
                          onClick={() => toggleFavoritePurposeId(spId)}
                          size='sm'
                          variant='solid'
                        >
                          <StarIcon/>
                        </IconButton>
                      </Box>
                    }
                  </Box>
                </Grid>
              ))}
            </Box>
          </>}
        </Stack>

        {/* ALL PROMPTS */}

        <Stack direction='column' px={2} mb={showPrompts ? 8 : 0}>
          <Stack direction='row' alignItems='center' justifyContent='space-between' pb={1} mb={1} 
            sx={{ borderBottom: `1px solid ${theme.vars.palette.neutral[200]}` }}
          >
            <Button
              onClick={toggleShowPrompts} 
              color='neutral' 
              size='sm' 
              variant='plain'
              startDecorator={<FormatListBulletedIcon />}
              endDecorator={showPrompts ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            >
              <Typography level='h2' component='h2'>All Prompts</Typography>
            </Button>
          </Stack>
          { showPrompts && <>
            { allPurposeIDs.length < 1 && <Typography level='body2' px={2} py={1}>No prompts.</Typography> }
            <Box
              display='grid' 
              gridTemplateColumns={{
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr',
                lg: '1fr 1fr 1fr 1fr',
                xl: '1fr 1fr 1fr 1fr 1fr',
              }}
              sx={{
                columnGap: 4,
                rowGap: 1,
              }}
            >
              {allPurposeIDs.sort().map((spId) => (
                <Grid key={spId}
                  gridRow={ isPurposeCustom(spId) ? '1' : undefined }
                  gridColumn={ isPurposeCustom(spId) ? '1 / -1' : undefined }
                  my={ isPurposeCustom(spId) ? 2 : undefined }
                  sx={{
                    ...(isPurposeActive(spId) && isPurposeCustom(spId) && {
                      background: 'var(--joy-palette-primary-solidBg)',
                      borderRadius: 'var(--joy-radius-sm)',
                    })
                  }}
                >
                  <Stack 
                    color="neutral"
                    direction='row' alignItems='center' spacing={1}
                    sx={{
                      borderRadius: 'var(--joy-radius-sm)',
                      ...(editFavorites && !isPurposeCustom(spId) && {
                        background: theme.vars.palette.background.level1,
                      })
                    }}
                  >
                    <Tooltip title={SystemPurposes[spId as SystemPurposeId]?.description} placement='left'>
                      <Button
                        variant={isPurposeActive(spId) ? 'solid' 
                          : isPurposeCustom(spId) ? 'outlined' 
                            : editFavorites ? 'plain' : 'soft'
                        }
                        color={isPurposeActive(spId) ? 'primary' : isPurposeCustom(spId) ? 'warning' : 'neutral'}
                        onClick={() => handlePurposeChanged(spId as SystemPurposeId)}
                        size={ isPurposeCustom(spId) ? 'lg' : 'sm' }
                        sx={{
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          width: '100%',
                          textAlign: 'start',
                          ...(editFavorites && !isPurposeCustom(spId) && {
                            background: systemPurposeId !== spId ? theme.vars.palette.background.level1 : undefined,
                          })
                        }}
                      >
                        <Box pr={1} fontSize='1.5rem'>
                          {SystemPurposes[spId as SystemPurposeId]?.symbol}
                        </Box>
                        <Box>
                          {SystemPurposes[spId as SystemPurposeId]?.title}
                        </Box>
                      </Button>
                    </Tooltip>
                    { editFavorites && !isPurposeCustom(spId) &&
                      <IconButton
                        color='warning'
                        onClick={() => toggleFavoritePurposeId(spId)}
                        size='sm'
                        variant={favoritePurposeIDs.includes(spId) ? 'solid' : 'plain'}
                      >
                        { favoritePurposeIDs.includes(spId) ? <StarIcon/> : <StarBorderIcon/> }
                      </IconButton>
                    }
                  </Stack>

                  {systemPurposeId === 'Custom' && isPurposeCustom(spId) &&
                    <Box p={1}>
                      <Textarea
                        autoFocus 
                        defaultValue={SystemPurposes['Custom']?.systemMessage}
                        minRows={3}
                        onChange={handleCustomSystemMessageChange}
                        placeholder={'Your custom system message…'}
                        variant='outlined' 
                        sx={{
                          background: theme.vars.palette.background.level1,
                          lineHeight: 1.75,
                        }} 
                      />
                    </Box>
                  }
                </Grid>
              ))}
            </Box>
          </>}
        </Stack>

      </Stack>

    </Stack>
  </>;
}