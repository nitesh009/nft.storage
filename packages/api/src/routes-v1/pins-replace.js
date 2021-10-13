import { JSONResponse } from '../utils/json-response.js'
import * as cluster from '../cluster.js'
import { validate } from '../utils/auth-v1.js'
import { parseCidPinning } from '../utils/utils.js'
import { toPinsResponse } from '../utils/db-transforms.js'

/** @type {import('../utils/router.js').Handler} */
export async function pinsReplace(event, ctx) {
  const { db, user, key } = await validate(event, ctx)

  const existingCid = ctx.params.requestid
  const existingUpload = await db.getUpload(existingCid, user.id)

  if (!existingUpload) {
    return new JSONResponse(
      { error: { reason: 'NOT_FOUND', details: 'pin not found' } },
      { status: 404 }
    )
  }

  /** @type {import('../bindings').PinsAddInput} */
  const pinData = await event.request.json()

  // validate CID
  const cid = parseCidPinning(pinData.cid)
  if (!cid) {
    return new JSONResponse(
      {
        error: {
          reason: 'INVALID_PIN_DATA',
          details: `Invalid request id: ${pinData.cid}`,
        },
      },
      { status: 400 }
    )
  }

  if (pinData.cid === existingCid) {
    return new JSONResponse(
      {
        error: {
          reason: 'INVALID_PIN_DATA',
          details: 'exiting and replacement CID are the same',
        },
      },
      { status: 400 }
    )
  }

  // validate name
  if (pinData.name && typeof pinData.name !== 'string') {
    return new JSONResponse(
      { error: { reason: 'INVALID_PIN_DATA', details: 'invalid name' } },
      { status: 400 }
    )
  }
  let meta

  // validate meta
  if (pinData.meta) {
    if (typeof pinData.meta !== 'object' || Array.isArray(pinData.meta)) {
      return new JSONResponse(
        { error: { reason: 'INVALID_PIN_DATA', details: 'invalid metadata' } },
        { status: 400 }
      )
    }
    meta = Object.fromEntries(
      Object.entries(pinData.meta).filter(([, v]) => typeof v === 'string')
    )
  }

  await cluster.pin(cid.contentCid, {
    origins: pinData.origins,
    name: pinData.name,
    metadata: pinData.meta,
  })

  const upload = await db.createUpload({
    type: 'Remote',
    content_cid: cid.contentCid,
    source_cid: cid.sourceCid,
    user_id: user.id,
    key_id: key?.id,
    origins: pinData.origins,
    meta: pinData.meta,
    name: pinData.name,
  })

  if (upload.content.pin[0].status === 'PinError') {
    await cluster.recover(upload.content_cid)
  }

  await db.deleteUpload(existingCid, user.id)

  return new JSONResponse(toPinsResponse(upload))
}