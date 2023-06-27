import * as React from 'react';

import { IconButton, Switch, useColorScheme } from '@mui/joy';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

import { useOnMount } from '~/common/util/useOnMount';

import { floatingButtonsSx } from '~/common/theme';

// Initial Theme Priority:
//   1. site-specific user preference (local storage)
//   2a. browser theme (if present)
//   2b. system (OS) theme
//   3. default to light theme
//
// After initial theme is set, theme will update to match whichever is changed _most recently_.
// Eg, system theme changes will override site-specific user preference.
//
// Interactions between browser theme (2a) and system theme (2b) are up to the browser.
// When set, Firefox overrides system theme entirely.

export function DarkModeToggle() {
  const { mode: colorMode, setMode: setColorMode } = useColorScheme();

  const themeStorageKey = 'theme'
  const DARK = 'dark'
  const LIGHT = 'light'

  const getTheme = () => {
    const systemTheme =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT
    return window.localStorage.getItem(themeStorageKey) || systemTheme
  }

  const setTheme = (theme?: string) => {
    window.localStorage.setItem(themeStorageKey, theme || getTheme())
    setColorMode(theme === LIGHT || getTheme() === LIGHT ? 'light' : 'dark');
  }

  const [themeDark, setThemeDark] = React.useState(() => {
    return getTheme() === DARK
  })

  const switchTheme = () => {
    const theme = getTheme() === DARK ? LIGHT : DARK
    setTheme(theme);
  }

  const listenLocalStorage = (setThemeDark: any) => {
    // Listen for local storage updates in *other* windows/tabs,
    // so that theme changes propogate across all windows.
    window.addEventListener('storage', (storage) => {
      if (storage.key === themeStorageKey) {
        setTheme(getTheme())
        setThemeDark(getTheme() === DARK)
      }
    })
  }
  
  const listenSystemTheme = (setThemeDark: any) => {
    // Listen for system (or browser) theme changes and set theme to match.
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        const theme = event.matches ? DARK : LIGHT
        setTheme(theme)
        setThemeDark(getTheme() === DARK)
      })
  }

  useOnMount(setTheme)
  listenSystemTheme(setThemeDark)
  listenLocalStorage(setThemeDark)

  const handleToggleDarkMode = () => {
    switchTheme()
    setThemeDark(!themeDark)
  };

  return (<>
    <IconButton onClick={handleToggleDarkMode} size='sm' color='neutral' variant='outlined' sx={{ ...floatingButtonsSx }}>
      {themeDark ? <DarkModeIcon/> : <LightModeIcon/>}
    </IconButton>
  </>)
}