import createCache from '@emotion/cache';
import { JetBrains_Mono } from 'next/font/google';
import { extendTheme } from '@mui/joy';
import { keyframes } from '@emotion/react';


// CSS utils
export const hideOnMobile = { display: { xs: 'none', md: 'flex' } };
export const hideOnDesktop = { display: { xs: 'flex', md: 'none' } };

// Dimensions
export const settingsGap = 2;
export const settingsCol1Width = 150;

// Floating Buttons
export const floatingButtonsSx = { backdropFilter: 'blur(6px) grayscale(0.8)' }


// Theme & Fonts

const jetBrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['monospace'],
});

const themeHarlan = {
  palette: {
    primary: {
      500: 'rgb(118,108,172)', // Harlan purple
      solidBg: 'rgb(118,108,172)', // Harlan purple
      solidHoverBg: 'rgb(84,75,145)', // Harlan purple
      solidActiveBg: 'rgb(84,75,145, 0.9)', // Harlan purple
      solidDisabledBg: 'rgb(84,75,145, 0.9)', // Harlan purple
    }
  }
}

export const theme = extendTheme({
  fontFamily: {
    body: 'system-ui, sans-serif',
    code: jetBrainsMono.style.fontFamily,
    display: 'system-ui, sans-serif',
  },
  colorSchemes: {
    light: {
      palette: {
        background: {
          body: '#EFEFEF',
        },
        primary: {
          // 50: '#F4FAFF', // softBg
          100: '#f0f8ff', // plainHoverBg  -  #DDF1FF | #f0f4ff | #f0f8ff (aliceblue)
          // 200: '#ADDBFF',
          // 300: '#6FB6FF',
          // 400: '#3990FF',
          500: themeHarlan.palette.primary[500],
          // 600: '#054DA7', // solidHoverBg [IconButton.plain (fg)]
          // 700: '#02367D',
          // 800: '#072859',
          // 900: '#00153C',
          solidBg: themeHarlan.palette.primary.solidBg,
          solidHoverBg: themeHarlan.palette.primary.solidHoverBg,
          solidActiveBg: themeHarlan.palette.primary.solidActiveBg,
          solidDisabledBg: themeHarlan.palette.primary.solidDisabledBg,
        },
        neutral: {
          solidBg: 'var(--joy-palette-neutral-700, #434356)',
          solidHoverBg: 'var(--joy-palette-neutral-800, #25252D)', // hover Neutral buttons (App Bar)
          lightChannel: '239 239 239',
          50: '#F7F7F8',
          100: '#EFEFEF',
          200: '#D8D8DF',
          300: '#B9B9C6',
          400: '#8F8FA3',
          500: '#73738C',
          600: '#5A5A72', // solidBg [Button.solid]
          700: '#434356', // solidHoverBg
          800: '#25252D',
          900: '#131318',
        },
      },
    },
    dark: {
      palette: {
        background: {
          body: '#25252D',
          surface: 'var(--joy-palette-neutral-900, #131318)',
          level1: 'var(--joy-palette-common-black, #09090D)',
          level2: 'var(--joy-palette-neutral-800, #25252D)',
          // popup: 'var(--joy-palette-common-black, #09090D)',
        },
        primary: {
          500: themeHarlan.palette.primary[500],
          solidBg: themeHarlan.palette.primary.solidBg,
          solidHoverBg: themeHarlan.palette.primary.solidHoverBg,
          solidActiveBg: themeHarlan.palette.primary.solidActiveBg,
          solidDisabledBg: themeHarlan.palette.primary.solidDisabledBg,
        },
        neutral: {
          lightChannel: '37 37 45',
        }
      },
    },
  },
  typography: {
    h1: {
      fontSize: '1rem',
      fontWeight: '800',
      lineHeight: 1,
    },
    h2: {
      fontSize: '1rem',
      fontWeight: '600',
    },
    h3: {
      fontSize: '0.875rem',
      fontWeight: '600',
    }
  },
});

export const bodyFontClassName = 'systemUI';

export const cssRainbowColorKeyframes = keyframes`
  100%, 0% {
    color: rgb(255, 0, 0);
  }
  8% {
    color: rgb(204, 102, 0);
  }
  16% {
    color: rgb(128, 128, 0);
  }
  25% {
    color: rgb(77, 153, 0);
  }
  33% {
    color: rgb(0, 179, 0);
  }
  41% {
    color: rgb(0, 153, 82);
  }
  50% {
    color: rgb(0, 128, 128);
  }
  58% {
    color: rgb(0, 102, 204);
  }
  66% {
    color: rgb(0, 0, 255);
  }
  75% {
    color: rgb(127, 0, 255);
  }
  83% {
    color: rgb(153, 0, 153);
  }
  91% {
    color: rgb(204, 0, 102);
  }`;


// Emotion Cache (with insertion point on the SSR pass)

const isBrowser = typeof document !== 'undefined';

export function createEmotionCache() {
  let insertionPoint;

  if (isBrowser) {
    // On the client side, _document.tsx has a meta tag with the name "emotion-insertion-point" at the top of the <head>.
    // This assures that MUI styles are loaded first, and allows allows developers to easily override MUI styles with other solutions like CSS modules.
    const emotionInsertionPoint = document.querySelector<HTMLMetaElement>(
      'meta[name="emotion-insertion-point"]',
    );
    insertionPoint = emotionInsertionPoint ?? undefined;
  }

  return createCache({ key: 'mui-style', insertionPoint });
}

// MISC

// For next April Fools' week
// export const foolsMode = new Date().getMonth() === 3 && new Date().getDate() <= 7;

// console.log(theme);