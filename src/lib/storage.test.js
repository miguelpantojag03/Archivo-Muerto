import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storageGet, storageSet, storageRemove, storageGetLocal, storageSetLocal } from './storage.js'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('storageSet / storageGet', () => {
  it('round-trips a value through localStorage by default', () => {
    storageSet('k', { a: 1 })
    expect(storageGet('k')).toEqual({ a: 1 })
    expect(localStorage.getItem('k')).not.toBeNull()
    expect(sessionStorage.getItem('k')).toBeNull()
  })

  it('writes to sessionStorage when persistent=false', () => {
    storageSet('k', { a: 1 }, false)
    expect(sessionStorage.getItem('k')).not.toBeNull()
    expect(localStorage.getItem('k')).toBeNull()
  })

  it('storageGet falls back to sessionStorage when not in localStorage', () => {
    storageSet('k', 'session-value', false)
    expect(storageGet('k')).toBe('session-value')
  })

  it('storageGet prefers localStorage over sessionStorage', () => {
    storageSet('k', 'local-value', true)
    sessionStorage.setItem('k', JSON.stringify('session-value'))
    expect(storageGet('k')).toBe('local-value')
  })

  it('storageGet returns null for a missing key', () => {
    expect(storageGet('missing')).toBeNull()
  })

  it('storageGet returns null instead of throwing on corrupt JSON', () => {
    localStorage.setItem('k', '{not json')
    expect(storageGet('k')).toBeNull()
  })

  it('storageSet swallows a quota-exceeded error instead of throwing', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError')
    })
    expect(() => storageSet('k', 'v')).not.toThrow()
    spy.mockRestore()
  })
})

describe('storageRemove', () => {
  it('removes the key from both stores', () => {
    localStorage.setItem('k', '"v"')
    sessionStorage.setItem('k', '"v"')
    storageRemove('k')
    expect(localStorage.getItem('k')).toBeNull()
    expect(sessionStorage.getItem('k')).toBeNull()
  })
})

describe('storageGetLocal / storageSetLocal', () => {
  it('round-trips a value through localStorage only', () => {
    storageSetLocal('k', [1, 2, 3])
    expect(storageGetLocal('k')).toEqual([1, 2, 3])
    expect(sessionStorage.getItem('k')).toBeNull()
  })

  it('storageGetLocal returns null for a missing key', () => {
    expect(storageGetLocal('missing')).toBeNull()
  })
})
