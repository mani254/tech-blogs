import test, { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { publishedOnly } from '../src/access/publishedOnly.ts'
import { isAdmin } from '../src/access/isAdmin.ts'
import { isEditor } from '../src/access/isEditor.ts'
import { isAuthor } from '../src/access/isAuthor.ts'
import { adminOnlyFieldAccess } from '../src/collections/Users/access.ts'

describe('Access Control Security Matrix Tests', () => {
  it('restricts public / unauthenticated queries to published status only', () => {
    const publicResult = publishedOnly({
      req: { user: null } as any,
    } as any)

    assert.deepEqual(publicResult, {
      _status: {
        equals: 'published',
      },
    })
  })

  it('permits administrators and editors full unrestricted read access (including drafts)', () => {
    const adminResult = publishedOnly({
      req: { user: { role: 'admin' } } as any,
    } as any)
    const editorResult = publishedOnly({
      req: { user: { role: 'editor' } } as any,
    } as any)

    assert.equal(adminResult, true)
    assert.equal(editorResult, true)
  })

  it('permits authors to read published articles PLUS their own drafts', () => {
    const authorResult = publishedOnly({
      req: {
        user: {
          role: 'author',
          authorProfile: 'author-profile-123',
        },
      } as any,
    } as any)

    assert.deepEqual(authorResult, {
      or: [
        {
          _status: {
            equals: 'published',
          },
        },
        {
          author: {
            equals: 'author-profile-123',
          },
        },
      ],
    })
  })

  it('correctly evaluates isAdmin role', () => {
    assert.equal(isAdmin({ req: { user: { role: 'admin' } } } as any), true)
    assert.equal(isAdmin({ req: { user: { role: 'editor' } } } as any), false)
    assert.equal(isAdmin({ req: { user: { role: 'author' } } } as any), false)
    assert.equal(isAdmin({ req: { user: null } } as any), false)
  })

  it('correctly evaluates isEditor role (admins + editors)', () => {
    assert.equal(isEditor({ req: { user: { role: 'admin' } } } as any), true)
    assert.equal(isEditor({ req: { user: { role: 'editor' } } } as any), true)
    assert.equal(isEditor({ req: { user: { role: 'author' } } } as any), false)
    assert.equal(isEditor({ req: { user: null } } as any), false)
  })

  it('correctly evaluates isAuthor role (admins + editors + authors)', () => {
    assert.equal(isAuthor({ req: { user: { role: 'admin' } } } as any), true)
    assert.equal(isAuthor({ req: { user: { role: 'editor' } } } as any), true)
    assert.equal(isAuthor({ req: { user: { role: 'author' } } } as any), true)
    assert.equal(isAuthor({ req: { user: null } } as any), false)
  })

  it('field-level security: only admins can modify user role or account status', () => {
    assert.equal(adminOnlyFieldAccess({ req: { user: { role: 'admin' } } } as any), true)
    assert.equal(adminOnlyFieldAccess({ req: { user: { role: 'editor' } } } as any), false)
    assert.equal(adminOnlyFieldAccess({ req: { user: { role: 'author' } } } as any), false)
    assert.equal(adminOnlyFieldAccess({ req: { user: null } } as any), false)
  })
})
