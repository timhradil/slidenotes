import os
import uuid
import json
import boto3

# submitRequest
def lambda_handler(event, context):
    print('received event:')
    print(event)

    # Static Variables
    db_client = boto3.client('dynamodb')
    DYNAMODB_TABLE = os.environ['DYNAMODB_TABLE']

    sqs_client = boto3.client('sqs')
    SQS_QUEUE = os.environ['SQS_QUEUE']

    body = json.loads(event['body'])
    s3key = body['s3key']

    # ToDo: Determine validity of request 

    # Create DynamoDB Entry
    id = str(uuid.uuid4())
    response = db_client.put_item(
      TableName=DYNAMODB_TABLE,
      Item={
        'id':{'S': id},
        's3key':{'S': s3key},
        'raw_text':{'S': '_'},
        'notes_text':{'S': '_'},
      },
    )
    
    # Create SQS Message
    response = sqs_client.send_message(
      QueueUrl=SQS_QUEUE,
      MessageBody=id
    )

    return {
        'statusCode': 202,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps({"id": id})
    }
