/* eslint-disable padded-blocks, no-undef */
/* eslint-disable no-unused-vars, no-use-before-define, no-restricted-syntax, guard-for-in, no-await-in-loop, no-underscore-dangle, no-shadow, implicit-arrow-linebreak, new-cap */
/* eslint-disable global-require */
const crypto = require('crypto')

const helpers = require('../../lib/helpers')
const mongoConnection = require('../../lib/mongo_connection')

module.exports = {
    mockRequest: () => ({
        body: {},
        params: {},
        query: {},
        headers: {},
    }),
    mockResponse: () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        }
        return res
    },
    mockDbList: () => () => ({
        list: jest.fn(),
    }),
    getUserToken: () => Buffer.from(
        JSON.stringify({
            user_id: global.GLOBAL_VARIABLES.user_id,
            username: global.GLOBAL_VARIABLES.username,
            enterprise_id: global.GLOBAL_VARIABLES.enterprise_id,
            user_type: 'EXTERNAL_PROVIDER',
            status: 'Active',
            first_name: global.GLOBAL_VARIABLES.first_name,
            last_name: global.GLOBAL_VARIABLES.last_name,
            facility_id: global.GLOBAL_VARIABLES.facility_id,
            current_group_id: global.GLOBAL_VARIABLES.current_group_id,
        }),
    ).toString('base64'),
    getRandomDate: (start, end) => new Date(
        start.getTime() + (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * (end.getTime() - start.getTime()),
    ),
    mockCrypto: () => jest.spyOn(crypto, 'createHash').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn(() => 'mocked-hash-hex'),
    }),
    mockDbConnection: () => jest.spyOn(mongoConnection, 'connect').mockResolvedValue({
        disconnect: jest.fn().mockResolvedValue(),
    }),
    mockStreamToString: () => jest.spyOn(helpers, 'streamToString').mockImplementation(() => Promise.resolve(Buffer.from('mock file content'))),
    mockAuthorizer: () => jest.spyOn(helpers, 'checkAuthorized').mockImplementation(() => Promise.resolve('ALLOW')),
}
