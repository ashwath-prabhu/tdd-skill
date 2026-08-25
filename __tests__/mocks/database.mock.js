/* eslint-disable padded-blocks, no-undef */
/* eslint-disable no-unused-vars, no-use-before-define, no-restricted-syntax, guard-for-in, no-await-in-loop, no-underscore-dangle, no-shadow, implicit-arrow-linebreak, new-cap */
/* eslint-disable global-require */
// Mock for mongo_connection module to prevent undefined URI errors
module.exports = {
    connect: jest.fn().mockResolvedValue({
        disconnect: jest.fn().mockResolvedValue(),
        connection: {
            readyState: 1,
            host: 'localhost',
            port: 27017,
            name: 'test_db',
        },
    }),
}
