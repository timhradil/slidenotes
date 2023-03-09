import os
import json
import boto3
import openai
import tiktoken
from threading import Thread

def getOpenAPIKey():
    secret_name = "OpenAIKey"
    region_name = "us-west-2"
    session = boto3.session.Session()
    client = session.client(
      service_name='secretsmanager',
      region_name=region_name
    )

    get_secret_value_response = client.get_secret_value(
      SecretId=secret_name
    )

    return json.loads(get_secret_value_response['SecretString'])['Secret Key']

def makeOpenAiCall(message, split_notes_text, premium, index):
    openai.api_key = getOpenAPIKey()
    model='gpt-3.5-turbo'
    system_message = "You are a helpful assistant who writes bulleted notes from the users text with each bullet starting with a \"-\""
    if premium:
      system_message = "You are a helpful assistant who writes bulleted notes from the users text adding extra information with each bullet starting with a \"-\""
    response = openai.ChatCompletion.create(
      model=model,
      messages=[
        {"role": "system", "content": system_message},
        {"role": "user", "content": message},
      ],
      max_tokens=1000
    )
    split_notes_text[index] = response['choices'][0]['message']['content']

# summarizeText
def lambda_handler(event, context):
    print('received event:')
    print(event)

    try:
      # Static Variables
      s3_client = boto3.client('s3')
      S3_BUCKET = os.environ['S3_BUCKET']      

      db_client = boto3.client('dynamodb')
      DYNAMODB_TABLE = os.environ['DYNAMODB_TABLE']

      id = event['Records'][0]['body']

      # Get Text From DynamoDB
      response = db_client.get_item(
        TableName=DYNAMODB_TABLE,
        Key={
          'id':{'S': id}
        },
        AttributesToGet=[
          's3key',
          'raw_text',
          'raw_text_hash',
          'premium'
        ]
      )

      s3key = response['Item']['s3key']['S']
      raw_text = response['Item']['raw_text']['S']
      raw_text_hash = response['Item']['raw_text_hash']['S']
      premium = response['Item']['premium']['S']
    
      # Check for cached raw_text
      notes_text = ''
  
      response = db_client.query(
        TableName=DYNAMODB_TABLE,
        IndexName='raw_text_cache_hash',
        KeyConditionExpression='raw_text_hash = :raw_text_hash',
        FilterExpression='premium = :premium AND currentStatus = :currentStatus',
        FilterExpression='currentStatus = :currentStatus',
        ExpressionAttributeValues={
          ':raw_text_hash': { 'S': raw_text_hash },
          ':premium': { 'S': premium },
          ':currentStatus': { 'S': 'Finished' },
        },
        ProjectionExpression='notes_text',
        Limit=1,
      )
      items = response['Items']
      if len(items) > 0:
          notes_text = items[0]['notes_text']['S']
      else: 
        # Prep Text
        split_size = 2500
        encoding = tiktoken.get_encoding("cl100k_base")
        encoded_text = encoding.encode(raw_text)
        split_encoded_text = [encoded_text[i:i+split_size] for i in range(0, len(raw_text), split_size)]
        threads = [None] * len(split_encoded_text)
        split_notes_text = [None] * len(split_encoded_text)

        # Create new notes
        for i in range(len(split_encoded_text)):
          threads[i] = Thread(target=makeOpenAiCall, args=(' '.join(split_encoded_text[i]), split_notes_text, i))
          threads[i].start()
    
        for i in range(len(split_encoded_text)):
          threads[i].join()
      
        notes_text = ''.join(split_notes_text)

      # Update DynamoDB Entry
      response = db_client.update_item(
        TableName=DYNAMODB_TABLE,
        Key={
          'id':{'S': id}
        },
        UpdateExpression='SET notes_text = :notes_text, currentStatus = :currentStatus',
        ExpressionAttributeValues={':notes_text': {'S': notes_text}, ':currentStatus':{'S': 'Finished'}}
      )
   
      # Remove presentation from S3 bucket
      response = s3_client.delete_object(Bucket=S3_BUCKET, Key=s3key)
      
    except BaseException as error:
      response = db_client.update_item(
        TableName=DYNAMODB_TABLE,
        Key={
          'id':{'S': id}
        },
        UpdateExpression='SET currentStatus = :currentStatus',
        ExpressionAttributeValues={':currentStatus': {'S': 'Creating Notes Failed, Try Again'}}
      )
