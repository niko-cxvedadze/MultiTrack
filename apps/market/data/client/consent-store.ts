'use client'

import Cookies from 'js-cookie'
import { useSyncExternalStore } from 'react'

// ── Types ───────────────────────────────────────────────────────────────

export type ConsentStatus = 'accepted' | 'declined' | 'pending'

// ── Cookie storage ─────────────────────────────────────────────────────

const COOKIE_KEY = 'printa_cookie_consent'
const COOKIE_EXPIRY = 365 // days

// Reads the current consent value from the cookie.
// Returns 'pending' if the cookie doesn't exist or has an unexpected value.
function readConsent(): ConsentStatus {
  const value = Cookies.get(COOKIE_KEY)
  if (value === 'accepted' || value === 'declined') return value
  return 'pending'
}

// Persists the user's consent choice to a cookie that lasts 1 year.
function writeConsent(status: 'accepted' | 'declined') {
  Cookies.set(COOKIE_KEY, status, { expires: COOKIE_EXPIRY, sameSite: 'lax' })
}

// ── Consent reactivity (useSyncExternalStore) ──────────────────────────
//
// This section implements the "external store" pattern that React's
// useSyncExternalStore hook requires. The three pieces are:
//   1. subscribe(listener)  — registers a callback; returns an unsubscribe fn
//   2. getSnapshot()        — returns the cached current value (must be
//                             referentially stable when nothing changed)
//   3. notify()             — updates the cached value and calls all listeners,
//                             which tells React to re-render subscribed components

type Listener = () => void

// All components using useConsentStatus() register their re-render callback here.
let consentListeners: Listener[] = []

// Cached snapshot — only updated inside notifyConsent().
// On the server (SSR) there's no window/cookie, so we default to 'pending'.
let consentSnapshot: ConsentStatus = typeof window !== 'undefined' ? readConsent() : 'pending'

// Re-reads the cookie, updates the cached snapshot, and triggers re-renders
// in every component that called useConsentStatus().
function notifyConsent() {
  consentSnapshot = readConsent()
  consentListeners.forEach((l) => l())
}

// Called by useSyncExternalStore — registers a listener and returns
// a cleanup function that removes it (standard subscribe contract).
function subscribeConsent(listener: Listener) {
  consentListeners.push(listener)
  return () => {
    consentListeners = consentListeners.filter((l) => l !== listener)
  }
}

// Returns the cached consent value. Because we only update `consentSnapshot`
// inside notifyConsent(), this returns the same reference between changes,
// preventing unnecessary re-renders.
function getConsentSnapshot() {
  return consentSnapshot
}

// During SSR there are no cookies, so we always report 'pending'.
function getConsentServerSnapshot() {
  return 'pending' as ConsentStatus
}

// ── Dialog reactivity (useSyncExternalStore) ───────────────────────────
//
// A second independent external store that tracks whether the consent
// dialog is open or closed. Same subscribe/getSnapshot/notify pattern.

let dialogListeners: Listener[] = []
let dialogSnapshot = false

function notifyDialog() {
  dialogListeners.forEach((l) => l())
}

function subscribeDialog(listener: Listener) {
  dialogListeners.push(listener)
  return () => {
    dialogListeners = dialogListeners.filter((l) => l !== listener)
  }
}

function getDialogSnapshot() {
  return dialogSnapshot
}

// Dialog is always closed during SSR.
function getDialogServerSnapshot() {
  return false
}

// ── Public API ─────────────────────────────────────────────────────────

// Writes 'accepted' to the cookie and notifies all subscribed components.
export function acceptCookies() {
  writeConsent('accepted')
  notifyConsent()
}

// Writes 'declined' to the cookie and notifies all subscribed components.
export function declineCookies() {
  writeConsent('declined')
  notifyConsent()
}

// React hook — returns the current consent status and re-renders
// automatically whenever it changes (via the external store mechanism).
export function useConsentStatus(): ConsentStatus {
  return useSyncExternalStore(subscribeConsent, getConsentSnapshot, getConsentServerSnapshot)
}

// Stores a callback to replay after the user accepts cookies.
// For example, if the user clicks "Add to Cart" before consenting,
// the add-to-cart action is saved here and replayed after acceptance.
let pendingAction: (() => void) | null = null

// Opens the blocking consent dialog (e.g. when user tries to add to cart
// but hasn't accepted cookies yet).
export function openCookieConsentDialog() {
  dialogSnapshot = true
  notifyDialog()
}

// Closes the dialog and discards any pending action.
export function closeCookieConsentDialog() {
  dialogSnapshot = false
  pendingAction = null
  notifyDialog()
}

// Accepts cookies, closes the dialog, and replays the pending action
// (e.g. the "Add to Cart" that originally triggered the dialog).
export function acceptCookiesAndReplay() {
  acceptCookies()
  dialogSnapshot = false
  notifyDialog()
  if (pendingAction) {
    const action = pendingAction
    pendingAction = null
    action()
  }
}

// React hook — returns true when the consent dialog should be shown.
export function useCookieConsentDialog(): boolean {
  return useSyncExternalStore(subscribeDialog, getDialogSnapshot, getDialogServerSnapshot)
}

// Gate function for actions that require cookie consent.
// If already accepted → returns true (caller proceeds immediately).
// If not → saves the action as pendingAction, opens the consent dialog,
// and returns false (caller should abort). When the user accepts,
// acceptCookiesAndReplay() will execute the saved action.
export function requireCookieConsent(onAccept?: () => void): boolean {
  if (readConsent() === 'accepted') return true
  pendingAction = onAccept ?? null
  openCookieConsentDialog()
  return false
}
