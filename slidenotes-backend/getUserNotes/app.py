import os
import json
import boto3
import time
import hashlib
from dynamodb_json import json_util as json_db

# getUserNotes
def lambda_handler(event, context):
    print('received event:')
    print(event)

    # Static Variables
    body = {}
    statusCode = 500

    try:
      db_client = boto3.client('dynamodb')
      DYNAMODB_TABLE = os.environ['DYNAMODB_TABLE']
      DYNAMODB_TABLE_USERS = os.environ['DYNAMODB_TABLE_USERS']

      request_body = json.loads(event['body'])
      phone_number = request_body['phoneNumber']

      phone_number_hash = hashlib.sha256(phone_number.encode('UTF-8')).hexdigest()
      response = db_client.get_item(
        TableName=DYNAMODB_TABLE_USERS,
        Key={
          'phoneNumberHash':{'S': phone_number_hash},
        },
        AttributesToGet=[
          'premiumPaidTime',
        ],
      )

      premium_paid_time = float(response['Item']['premiumPaidTime']['N'])

      now = time.time()
      body['premium'] = now < premium_paid_time
      
      response = db_client.query(
        TableName=DYNAMODB_TABLE,
        IndexName='phoneNumberHashIndex',
        KeyConditionExpression='phoneNumberHash = :phoneNumberHash',
        FilterExpression='currentStatus = :currentStatus',
        ExpressionAttributeValues={
          ':phoneNumberHash': { 'S': phone_number_hash},
          ':currentStatus': { 'S': 'Finished'}
        },
        ProjectionExpression='id,s3key',
      )

      body['items'] = json_db.loads(response['Items'])

      statusCode = 200

    except BaseException as error:
      print("An error ocurred: {} ".format(error))
      
    return {
        'statusCode': statusCode,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(body),
    }
