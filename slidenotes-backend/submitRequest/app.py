import os
import uuid
import json
import boto3
import hashlib
import time 
import datetime

# submitRequest
def lambda_handler(event, context):
    print('received event:')
    print(event)

    # Static Variables
    try:
      db_client = boto3.client('dynamodb')
      DYNAMODB_TABLE = os.environ['DYNAMODB_TABLE']
      DYNAMODB_TABLE_USERS = os.environ['DYNAMODB_TABLE_USERS']

      sqs_client = boto3.client('sqs')
      PPTX_SQS_QUEUE = os.environ['PPTX_SQS_QUEUE']
      PDF_SQS_QUEUE = os.environ['PDF_SQS_QUEUE']

      body = json.loads(event['body'])
      s3key = body['s3key']
      phone_number = body['phoneNumber']

      phone_number_hash = hashlib.sha256(phone_number.encode('UTF-8')).hexdigest()
      response = db_client.get_item(
       TableName=DYNAMODB_TABLE_USERS,
        Key={
          'phoneNumberHash':{'S': phone_number_hash},
       },
       AttributesToGet=[
          'premiumPaidTime',
          'timeCreated',
        ],
      )
   
      premiumPaidTime = float(response['Item']['premiumPaidTime']['N'])
      timeCreated = float(response['Item']['timeCreated']['N'])
      now = time.time()
      thirtyDaysInSeconds = 30 * 24 * 60 * 60 
      lastResetTime = timeCreated + (now - timeCreated) // thirtyDaysInSeconds * thirtyDaysInSeconds
      nextResetTime = lastResetTime + thirtyDaysInSeconds

      body = {}
      premium = str(now < premiumPaidTime)
      if not premium == 'True':
          response = db_client.query(
            TableName=DYNAMODB_TABLE,
            IndexName='phoneNumberHashIndex',
            KeyConditionExpression='phoneNumberHash = :phoneNumberHash AND timeCreated BETWEEN :lastResetDate AND :nextResetDate',
            FilterExpression='premium = :premium',
            ExpressionAttributeValues={
              ':phoneNumberHash': { 'S': phone_number_hash},
              ':premium': { 'S': premium },
              ':lastResetDate': { 'N': str(lastResetTime) },
              ':nextResetDate': { 'N': str(nextResetTime) },
            },
            ProjectionExpression='timeCreated',
          )
          freeItems = len(response['Items'])
          if freeItems < 3:
              if freeItems == 2:
                body['warning'] = 'That was your last free note'
              else:
                body['warning'] = 'Only ' + str(2 - freeItems) + ' free notes left'
          else:
              body['error'] = 'No free notes left. 3 more notes will be available on ' + datetime.date.fromtimestamp(nextResetTime).strftime("%m/%d/%Y") 
              return {
                'statusCode': 401,
                'headers': {
                  'Access-Control-Allow-Headers': '*',
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps(body)
              }
            
      # Create DynamoDB Entry
      id = str(uuid.uuid4())
      body['id'] = id
      response = db_client.put_item(
        TableName=DYNAMODB_TABLE,
        Item={
          'id':{'S': id},
          's3key':{'S': s3key},
          'raw_text':{'S': '_'},
          'raw_text_hash':{'S': '_'},
          'notes_text':{'S': '_'},
          'phoneNumberHash':{'S': phone_number_hash},
          'timeCreated':{'N': str(now)},
          'premium':{'S': premium},
          'currentStatus':{'S': 'Converting To Text'}
        },
      )
    
      # Create SQS Message
      extension = s3key.split('.')[-1]
      if extension == 'pptx':
        queueUrl = PPTX_SQS_QUEUE
      elif extension == 'pdf':
        queueUrl = PDF_SQS_QUEUE
        
      response = sqs_client.send_message(
        QueueUrl=queueUrl,
        MessageBody=id
      )

      return {
          'statusCode': 202,
          'headers': {
              'Access-Control-Allow-Headers': '*',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
          },
          'body': json.dumps(body)
      }
    
    except BaseException as error:
      print("An error ocurred: {} ".format(error))
      return {
          'statusCode': 500,
          'headers': {
              'Access-Control-Allow-Headers': '*',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
          },
          'body': json.dumps({})
      }
