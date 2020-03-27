const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient;

const TableName = process.env.TableName || 'covid19stats';

const updateDb = (data) => {
    const params = {
        Item: data,
        TableName,
        ReturnConsumedCapacity: "TOTAL"
    }
    return dynamo.put(params, (r) => {
        console.log({ dbput: r });
    }).promise();
}

module.exports = {
    updateDb
}