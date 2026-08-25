/* eslint-disable padded-blocks, no-undef */
/* eslint-disable no-unused-vars, no-use-before-define, no-restricted-syntax, guard-for-in, no-await-in-loop, no-underscore-dangle, no-shadow, implicit-arrow-linebreak, new-cap */
/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
const { mockClient } = require('aws-sdk-client-mock')
const {
    VerifiedPermissionsClient,
    IsAuthorizedCommand,
} = require('@aws-sdk/client-verifiedpermissions')
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs')
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const { DynamoDBClient, BatchWriteItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb')

let s3Mock
let sqsMock
let verifiedMock
let dynamoMock

const setupVerifiedPermissionsMock = ({ isAuthorizedResponse }) => {
    verifiedMock = mockClient(VerifiedPermissionsClient)
    verifiedMock.on(IsAuthorizedCommand).resolves(isAuthorizedResponse)
}

const setupSqsMock = () => {
    sqsMock = mockClient(SQSClient)
    sqsMock.on(SendMessageCommand).resolves({ sendMessageResponse: { MessageId: '12345' } })
}

const setupS3Mock = () => {
    s3Mock = mockClient(S3Client)
    s3Mock.on(GetObjectCommand).resolves({ getObjectResponse: { Body: Buffer.from('mock file content') } })
}

const setupDynamoBatchDeleteMock = ({ response = { UnprocessedItems: {} } } = {}) => {
    dynamoMock = mockClient(DynamoDBClient)
    dynamoMock.on(BatchWriteItemCommand).resolves(response)
    dynamoMock.on(BatchWriteItemCommand).resolves(response)
}

const setupQueryItemsMock = ({ response = { Items: [] } } = {}) => {
    dynamoMock = mockClient(DynamoDBClient)
    dynamoMock.on(BatchWriteItemCommand).resolves(response)
    dynamoMock.on(QueryCommand).resolves(response)
}

const resetAllMock = () => {
    if (s3Mock) s3Mock.reset()
    if (sqsMock) sqsMock.reset()
    if (verifiedMock) verifiedMock.reset()
    if (dynamoMock) dynamoMock.reset()
    return true
}

module.exports = {
    setupS3Mock,
    setupSqsMock,
    resetAllMock,
    setupVerifiedPermissionsMock,
    setupQueryItemsMock,
    setupDynamoBatchDeleteMock,
}
