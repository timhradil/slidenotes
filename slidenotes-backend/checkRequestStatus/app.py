import os
import json
import boto3

# checkRequestStatus
def lambda_handler(event, context):
    print('received event:')
    print(event)

    # Static Variables
    db_client = boto3.client('dynamodb')
    DYNAMODB_TABLE = os.environ['DYNAMODB_TABLE']

    body = json.loads(event['body'])
    id = body['id']

    # Check DynamoDB Entry
    response = db_client.get_item(
      TableName=DYNAMODB_TABLE,
      Key={
        'id': {'S': id}
      }
    )

    raw_text = response['Item']['raw_text']['S']
    notes_text = response['Item']['notes_text']['S']
 
    if len(raw_text) == 1:
      return {
        'statusCode': 202,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps({"status": "Extracting Text", "notes_text": "", "progress": 50})
      }

    if len(notes_text) == 1:
      return {
        'statusCode': 202,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps({"status": "Creating Notes", "notes_text": "", "progress": 75})
      }

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps({"status": "Finished", "notes_text": notes_text, "progress": 100})
    }
