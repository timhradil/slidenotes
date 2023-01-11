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
      },
      AttributesToGet=[
        's3key',
        'raw_text_hash',
        'notes_text',
      ]
    )

    s3key = response['Item']['s3key']['S']
    raw_text_hash = response['Item']['raw_text_hash']['S']
    notes_text = response['Item']['notes_text']['S']
 
    if len(raw_text_hash) <= 1:
      statusCode = 202
      status = "Extracting Text"
      progress = 50
      notes_text = ""
    elif len(notes_text) <= 1:
      statusCode = 202
      status = "Creating Notes"
      progress = 75
      notes_text = ""
    else:
      statusCode = 200
      status = "Finished"
      progress = 100
      
    return {
        'statusCode': statusCode,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps({"s3key": s3key, "status": status, "notes_text": notes_text, "progress": progress})
    }
