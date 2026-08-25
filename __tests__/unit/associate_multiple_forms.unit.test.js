/* eslint-disable no-undef, global-require, camelcase */
const mockDisconnect = jest.fn().mockResolvedValue()
const mockConnect = jest.fn().mockResolvedValue({ disconnect: mockDisconnect })
const mockCreateFacilityActivityLog = jest.fn().mockResolvedValue()

jest.mock('../../lib/mongo_connection', () => ({ connect: mockConnect }))
jest.mock('../../lib/auth', () => ({ getFacilityUserAuth: jest.fn() }))
jest.mock('../../lib/helpers', () => ({ headers: {}, checkAuthorized: jest.fn() }))
jest.mock('../../lib/utils/helpers', () => ({
    headers: {},
    createFacilityActivityLog: mockCreateFacilityActivityLog,
}))
jest.mock('../../entities/documentdb/DocumentPacket', () => ({ updateMany: jest.fn() }))
jest.mock('mongoose', () => ({
    Types: { ObjectId: jest.fn().mockImplementation((id) => id) },
    Error: { CastError: class CastError extends Error {} },
}))
jest.mock('../../lib/handler_wrapper', () => ({ withLogging: (fn) => fn }))

const makeUser = () => ({ facility_id: 'fac-001', enterprise_id: 'ent-001' })

const makeEvent = (queryOverrides = {}, bodyOverrides = {}) => ({
    queryStringParameters: { document_packet_ids: 'pkt-001,pkt-002', ...queryOverrides },
    body: JSON.stringify({
        forms: [
            { id: 'form-001', name: 'Form A' },
            { id: 'form-002', name: 'Form B' },
        ],
        ...bodyOverrides,
    }),
})

describe('associate_multiple_forms Unit Tests', () => {
    let handler
    let auth
    let helpers
    let DocumentPacket

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetModules()
        mockConnect.mockResolvedValue({ disconnect: mockDisconnect })

        handler = require('../../handlers/associate_multiple_forms').handler
        auth = require('../../lib/auth')
        helpers = require('../../lib/helpers')
        DocumentPacket = require('../../entities/documentdb/DocumentPacket')

        auth.getFacilityUserAuth.mockImplementation((ev) => ({
            ...ev,
            user: makeUser(),
            queryStringParameters: ev.queryStringParameters,
            body: ev.body,
        }))
        helpers.checkAuthorized.mockResolvedValue('ALLOW')
        DocumentPacket.updateMany.mockResolvedValue({ modifiedCount: 2 })
    })

    it('Handler should return 200 on successful association', async () => {
        const res = await handler(makeEvent())
        expect(res.statusCode).toBe(200)
        expect(DocumentPacket.updateMany).toHaveBeenCalledTimes(1)
    })

    it('Handler should return 403 when authorization denied', async () => {
        helpers.checkAuthorized.mockResolvedValue('DENY')
        const res = await handler(makeEvent())
        expect(res.statusCode).toBe(403)
    })

    it('Handler should return 409 when duplicate forms in the body', async () => {
        const res = await handler(makeEvent({}, {
            forms: [
                { id: 'form-001', name: 'Form A' },
                { id: 'form-001', name: 'Form A Duplicate' },
            ],
        }))
        expect(res.statusCode).toBe(409)
    })

    it('Handler should return 409 on DDB duplicate key error', async () => {
        const err = new Error('Duplicate')
        err.code = 11000
        DocumentPacket.updateMany.mockRejectedValue(err)
        const res = await handler(makeEvent())
        expect(res.statusCode).toBe(409)
    })

    it('Handler should return 500 on unexpected error', async () => {
        DocumentPacket.updateMany.mockRejectedValue(new Error('DB failure'))
        const res = await handler(makeEvent())
        expect(res.statusCode).toBe(500)
    })

    it('Handler should disconnect MongoDB in finally block', async () => {
        await handler(makeEvent())
        expect(mockDisconnect).toHaveBeenCalledTimes(1)
    })
})
