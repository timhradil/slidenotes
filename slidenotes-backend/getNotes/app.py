import os
import json
import boto3
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

      request_body = json.loads(event['body'])
      id = request_body['id']

      response = db_client.get_item(
        TableName=DYNAMODB_TABLE,
        Key={
          'id':{'S': id},
        },
        AttributesToGet=[
          'notes_text',
          's3key'
        ],
      )

      body = json_db.loads(response['Item'])

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
