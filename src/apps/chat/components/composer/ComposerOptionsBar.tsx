import { shallow } from 'zustand/shallow';

import { Stack } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';

import { useApplicationBarStore } from '../../../../common/layouts/appbar/store-applicationbar';


export function ComposerOptionsBar(props: { sx?: SxProps }) {
  // external state
  const { centerItems } = useApplicationBarStore(state => ({
    centerItems: state.centerItems,
    contextMenuItems: state.contextMenuItems,
  }), shallow);

  return (
    <Stack direction='row' alignItems='center' justifyContent='start' spacing={1} sx={{ ...(props.sx || {}) }}>
      { centerItems && centerItems }
    </Stack>
  );
}