/** AUTO-SUMMARY **
   Purpose: This file defines a ThemeProvider component that manages theme settings for a React application, handling theme changes and system preferences integration.

   Key Components:
   - `ThemeProvider`: A component that either passes through its children if a theme context already exists or renders the `Theme` component.
   - `Theme`: A component that manages the application's theme state, including system theme detection and theme application to the document.
   - `ThemeContext`: Context used to provide and consume theme-related values throughout the component tree.
   - `ThemeScript`: A script component included to handle theme-related operations.

   Functional Overview: The file provides functionality to:
   - Detect and apply user-selected or system-preferred themes.
   - Persist theme preferences across sessions using local storage.
   - React to system theme changes and synchronize the application's theme accordingly.
   - Manage theme-related attributes on the document's root element, supporting both class and attribute-based theming.

   Dependencies and Integrations: 
   - Utilizes utility functions from `./utils` for theme detection and animation control.
   - Integrates with `ThemeContext` for context-based theme management across the application.
   - Relies on React hooks like `useState`, `useEffect`, `useCallback`, and `useMemo` for managing state and side effects.

   Additional Context: The component supports optional features such as disabling transitions on theme change and handling forced themes, providing robust theming capabilities tailored to user and system preferences.
*** END-SUMMARY **/
'use client'

import React from 'react'
import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { MEDIA, ColorSchemes, disableAnimation, getSystemTheme } from './utils'

import { ThemeContext } from './ThemeContext'
import ThemeScript from './ThemeScript'

import { ThemeProviderProps } from './interface'

export const ThemeProvider = (props: ThemeProviderProps) => {
  const context = useContext(ThemeContext)

  // Ignore nested context providers, just passthrough children
  if (context) return <Fragment>{props.children}</Fragment>
  return <Theme {...props} />
}

const Theme = ({
  forcedTheme,
  disableTransitionOnChange = false,
  enableSystem = true,
  enableColorScheme = true,
  storageKey = 'theme',
  themes = ['light', 'dark'],
  defaultTheme = enableSystem ? 'system' : 'light',
  attribute = 'class',
  value,
  children,
  nonce
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<string>()
  const [resolvedTheme, setResolvedTheme] = useState<string>()
  const attrs = !value ? themes : Object.values(value)

  const applyTheme = useCallback(
    (theme: string) => {
      let resolved = theme
      if (!resolved) return

      // If theme is system, resolve it before setting theme
      if (theme === 'system' && enableSystem) {
        resolved = getSystemTheme()
      }

      const name = value ? value[resolved] : resolved
      const enable = disableTransitionOnChange ? disableAnimation() : null
      const root = document.documentElement

      if (attribute === 'class') {
        root.classList.remove(...attrs)

        if (name) root.classList.add(name)
      } else {
        if (name) {
          root.setAttribute(attribute, name)
        } else {
          root.removeAttribute(attribute)
        }
      }

      if (enableColorScheme) {
        const fallback = ColorSchemes.includes(defaultTheme) ? defaultTheme : null
        const colorScheme = ColorSchemes.includes(resolved) ? resolved : fallback
        root.style.colorScheme = colorScheme!
      }

      enable?.()
    },
    [
      attribute,
      attrs,
      defaultTheme,
      disableTransitionOnChange,
      enableColorScheme,
      enableSystem,
      value
    ]
  )

  const setTheme = useCallback<React.Dispatch<string>>(
    (theme) => {
      setThemeState(theme)

      // Save to storage
      try {
        localStorage.setItem(storageKey, theme)
      } catch (e) {
        // Unsupported
      }
    },
    [storageKey]
  )

  const handleMediaQuery = useCallback(
    (e: MediaQueryListEvent | MediaQueryList) => {
      const resolved = getSystemTheme(e)
      setResolvedTheme(resolved)

      if (theme === 'system' && enableSystem && !forcedTheme) {
        applyTheme('system')
      }
    },
    [theme, enableSystem, forcedTheme, applyTheme]
  )

  // Always listen to System preference
  useEffect(() => {
    const media = window.matchMedia(MEDIA)

    // Intentionally use deprecated listener methods to support iOS & old browsers
    media.addEventListener('change', handleMediaQuery)
    handleMediaQuery(media)

    return () => media.removeEventListener('change', handleMediaQuery)
  }, [handleMediaQuery])

  // localStorage event handling
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) {
        return
      }

      // If default theme set, use it if localstorage === null (happens on local storage manual deletion)
      const theme = e.newValue || defaultTheme
      setTheme(theme)
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [defaultTheme, setTheme, storageKey])

  // Whenever theme or forcedTheme changes, apply it
  useEffect(() => {
    return applyTheme(forcedTheme ?? theme!)
  }, [applyTheme, forcedTheme, theme])

  useEffect(() => {
    const theme = localStorage.getItem(storageKey)
    setThemeState(theme || defaultTheme)
    setResolvedTheme(theme!)
  }, [defaultTheme, storageKey])

  const providerValue = useMemo(
    () => ({
      theme,
      setTheme,
      forcedTheme,
      resolvedTheme: theme === 'system' ? resolvedTheme : theme,
      themes: enableSystem ? [...themes, 'system'] : themes,
      systemTheme: (enableSystem ? resolvedTheme : undefined) as 'light' | 'dark' | undefined
    }),
    [theme, setTheme, forcedTheme, resolvedTheme, enableSystem, themes]
  )

  return (
    <ThemeContext.Provider value={providerValue}>
      <ThemeScript
        {...{
          forcedTheme,
          disableTransitionOnChange,
          enableSystem,
          enableColorScheme,
          storageKey,
          themes,
          defaultTheme,
          attribute,
          value,
          children,
          attrs,
          nonce
        }}
      />
      {children}
    </ThemeContext.Provider>
  )
}
