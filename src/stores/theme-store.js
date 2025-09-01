import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // State
  const isDarkMode = ref(false)
  const systemPrefersDark = ref(false)

  // Getters
  const currentTheme = computed(() => isDarkMode.value ? 'dark' : 'light')
  const themeIcon = computed(() => isDarkMode.value ? 'light_mode' : 'dark_mode')
  const themeLabel = computed(() => isDarkMode.value ? 'Light Mode' : 'Dark Mode')

  // Actions
  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value
    applyTheme()
    saveThemePreference()
  }

  function setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      isDarkMode.value = theme === 'dark'
      applyTheme()
      saveThemePreference()
    }
  }

  function setSystemTheme() {
    isDarkMode.value = systemPrefersDark.value
    applyTheme()
  }

  function applyTheme() {
    const html = document.documentElement
    if (isDarkMode.value) {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
    }
  }

  function saveThemePreference() {
    try {
      localStorage.setItem('cad-theme-preference', isDarkMode.value ? 'dark' : 'light')
    } catch (error) {
      console.warn('Could not save theme preference:', error)
    }
  }

  function loadThemePreference() {
    try {
      const saved = localStorage.getItem('cad-theme-preference')
      if (saved === 'dark' || saved === 'light') {
        isDarkMode.value = saved === 'dark'
        applyTheme()
        return
      }
    } catch (error) {
      console.warn('Could not load theme preference:', error)
    }
    
    // Fallback to system preference
    setSystemTheme()
  }

  function initializeTheme() {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      systemPrefersDark.value = true
    }

    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        systemPrefersDark.value = e.matches
        // Only apply system theme if no user preference is saved
        if (!localStorage.getItem('cad-theme-preference')) {
          setSystemTheme()
        }
      })
    }

    // Load saved preference or use system preference
    loadThemePreference()
  }

  return {
    // State
    isDarkMode,
    systemPrefersDark,
    
    // Getters
    currentTheme,
    themeIcon,
    themeLabel,
    
    // Actions
    toggleTheme,
    setTheme,
    setSystemTheme,
    applyTheme,
    saveThemePreference,
    loadThemePreference,
    initializeTheme
  }
})
