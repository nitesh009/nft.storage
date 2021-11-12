import { signJWT } from '../../src/utils/jwt.js'
import { SALT } from './worker-globals.js'
import { PostgrestClient, PostgrestQueryBuilder } from '@supabase/postgrest-js'
import { DBClient } from '../../src/utils/db-client.js'

export const rawClient = new PostgrestClient(DATABASE_URL, {
  headers: {
    Authorization: `Bearer ${DATABASE_TOKEN}`,
  },
})

export const client = new DBClient(DATABASE_URL, DATABASE_TOKEN)

/**
 * @param {{publicAddress?: string, issuer?: string, name?: string}} userInfo
 */
export async function createTestUser({
  publicAddress = `0x73573${Date.now()}`,
  issuer = `did:eth:${publicAddress}`,
  name = 'A Tester',
} = {}) {
  const token = await signJWT(
    {
      sub: issuer,
      iss: 'nft-storage',
      iat: Date.now(),
      name: 'test',
    },
    SALT
  )

  const { data: user, error } = await client
    .upsertUser({
      email: 'a.tester@example.org',
      github_id: issuer,
      magic_link_id: issuer,
      name,
      public_address: publicAddress,
      picture: 'http://example.org/avatar.png',
    })
    .single()

  if (error || !user) {
    throw new Error('error creating user')
  }

  await client.createKey({
    name: 'test',
    secret: token,
    userId: user.id,
  })

  return { token, userId: user.id, githubId: user.github_id }
}

export class DBTestClient {
  /**
   * @param {{ token: string; userId: number; githubId: string }} opts
   */
  constructor(opts) {
    this.rawClient = rawClient
    this.client = client
    this.token = opts.token
    this.userId = opts.userId
    this.githubId = opts.githubId
  }

  /**
   * Add pin using the API
   *
   * @param {{ cid: string; name: string; }} data
   */
  async addPin(data) {
    const res = await fetch('pins', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cid: data.cid,
        name: data.name,
      }),
    })
    if (!res.ok) {
      throw new Error(`Failed to add pin: ${await res.text()}`)
    }
  }
}
/**
 * @param {{publicAddress?: string, issuer?: string, name?: string}} [userInfo]
 */
export async function createClientWithUser(userInfo) {
  const user = await createTestUser(userInfo)

  return new DBTestClient(user)
}
