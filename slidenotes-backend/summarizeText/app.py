import os
import json
import boto3
import openai
from threading import Thread
from boto3.dynamodb.conditions import Key

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

def makeOpenAiCall(prompt, split_notes_text, index):
    openai.api_key = getOpenAPIKey()
    response = openai.Completion.create(
      model='text-davinci-003',
      prompt=prompt, max_tokens=500)
    split_notes_text[index] = response.choices[0].text

# summarizeText
def lambda_handler(event, context):
    print('received event:')
    print(event)

    # Static Variables
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
        'raw_text'
      ]
    )

    raw_text = response['Item']['raw_text']['S']
    
    # Check for cached raw_text
    notes_text = ''
  
    response = db_client.query(
      TableName=DYNAMODB_TABLE,
      IndexName='raw_text_cache',
      KeyConditionExpression='raw_text = :raw_text',
      ExpressionAttributeValues={
        ':raw_text': { 'S': raw_text }
      },
      Limit=2,
    )
    items = response['Items']
    if len(items) > 1:
      for item in items:
        if len(item['notes_text']['S']) > 1:
          notes_text = item['notes_text']['S']
    else: 
      # Prep Text
      prompt_start = 'Write bulleted notes for this text: \"'
      prompt_end= '\" in this form: \"- text\n\t- text\"'
      split_size = 2500
      split_raw_text = [raw_text[i:i+split_size] for i in range(0, len(raw_text), split_size)]

      threads = [None] * len(split_raw_text)
      split_notes_text = [None] * len(split_raw_text)

      for i in range(len(split_raw_text)):
        prompt = prompt_start + split_raw_text[i] + prompt_end
        threads[i] = Thread(target=makeOpenAiCall, args=(prompt, split_notes_text, i))
        threads[i].start()
    
      for i in range(len(split_raw_text)):
        threads[i].join()
    
      notes_text = ''.join(split_notes_text)

    # Update DynamoDB Entry
    response = db_client.update_item(
      TableName=DYNAMODB_TABLE,
      Key={
        'id':{'S': id}
      },
      UpdateExpression='SET notes_text = :notes_text',
      ExpressionAttributeValues={':notes_text': {'S': notes_text}}
    )
    
