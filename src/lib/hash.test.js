import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, migrateOldHash } from './hash.js'

describe('hashPassword / verifyPassword', () => {
  it('produces a deterministic hash for the same input', async () => {
    const a = await hashPassword('Demo1234!')
    const b = await hashPassword('Demo1234!')
    expect(a).toBe(b)
  })

  it('produces different hashes for different passwords', async () => {
    const a = await hashPassword('Demo1234!')
    const b = await hashPassword('Other5678!')
    expect(a).not.toBe(b)
  })

  it('verifyPassword returns true for the matching password', async () => {
    const hash = await hashPassword('Demo1234!')
    expect(await verifyPassword('Demo1234!', hash)).toBe(true)
  })

  it('verifyPassword returns false for a wrong password', async () => {
    const hash = await hashPassword('Demo1234!')
    expect(await verifyPassword('WrongPass1!', hash)).toBe(false)
  })
})

describe('migrateOldHash', () => {
  it('upgrades a record with the legacy btoa hash to the new hash + version', async () => {
    const legacyHash = btoa(unescape(encodeURIComponent('AM_SALT_2024::Demo1234!')))
    const record = { passwordHash: legacyHash }
    const migrated = await migrateOldHash(record)
    expect(migrated.__hashVersion).toBe(2)
    expect(migrated.passwordHash).toBe(await hashPassword('Demo1234!'))
  })

  it('leaves a record with a non-legacy hash untouched', async () => {
    const record = { passwordHash: 'already-sha256-hex', __hashVersion: 2 }
    const migrated = await migrateOldHash(record)
    expect(migrated.passwordHash).toBe('already-sha256-hex')
  })
})
