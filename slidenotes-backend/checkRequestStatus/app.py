import os
import json
import boto3

# checkRequestStatus
def lambda_handler(event, context):
    print('received event:')
    print(event)

    # Static Variables
    body = {}
    statusCode = 500
    currentStatus = "Error"

    try:
      db_client = boto3.client('dynamodb')
      DYNAMODB_TABLE = os.environ['DYNAMODB_TABLE']

      body = json.loads(event['body'])
      id = body['id']

      # Check DynamoDB Entry
      response = db_client.get_item(
        TableName=DYNAMODB_TABLE,
        Key={
          'id': {'S': id}
        },
        AttributesToGet=[
          'currentStatus',
        ]
      )

      if 'Item' in response:
        currentStatus = response['Item']['currentStatus']['S']
        if 'Failed' in currentStatus:
          response = db_client.delete_item(
            TableName=DYNAMODB_TABLE,
            Key={
              'id':{'S': id}
            }
          )
        else:
          statusCode = 202
          if currentStatus == 'Finished':
            statusCode = 200

    except BaseException as error:
      print("An error ocurred: {} ".format(error))

    body['status'] = currentStatus
      
    return {
        'statusCode': statusCode,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(body),
    }
