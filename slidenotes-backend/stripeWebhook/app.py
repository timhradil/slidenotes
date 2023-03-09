import os
import json
import boto3
import time
import stripe

def getStripeKey():
    """
    secret_name = "TwilioKeys"
    region_name = "us-west-2"
    session = boto3.session.Session()
    client = session.client(
      service_name='secretsmanager',
      region_name=region_name
    )

    get_secret_value_response = client.get_secret_value(
      SecretId=secret_name
    )
    """

    return 'sk_test_51McXo9Lmvir5itla4cO3ZLwA2wR167MbfVNLsUNJ4wRblVjJeKb2CJfpOEC2HUuVChlC6hYFTXhEmu3h5zxf3YkM00oXFD6Q1E'

# checkPhoneCode
def lambda_handler(event, context):
    print('received event: ')
    print(event)
    
    try:
      # Static Variables
      db_client = boto3.client('dynamodb')
      DYNAMODB_TABLE = os.environ['DYNAMODB_TABLE']

      stripe.api_key = getStripeKey()
      webhook_secret = "whsec_tIS3BducuJJTayxg5NiFy3TtIsdvPs4v"

      signature = event['headers']['Stripe-Signature']
      rawBody = event['body']

      event = stripe.Webhook.construct_event(
        payload=rawBody,
        sig_header=signature,
        secret=webhook_secret,
      )

      data = event['data']['object']
      customerId = data['customer']

      response = db_client.query(
        TableName=DYNAMODB_TABLE,
        IndexName='stripeIdIndex',
        KeyConditionExpression='stripeId = :stripeId',
        ExpressionAttributeValues={
          ':stripeId': { 'S': customerId },
        },
        ProjectionExpression="phoneNumberHash",
        Limit=1
      )

      premium_paid_time = data['lines']['data'][0]['period']['end']
      phone_number_hash = response['Items'][0]['phoneNumberHash']
      response = db_client.update_item(
        TableName=DYNAMODB_TABLE,
        Key = {
          "phoneNumberHash": phone_number_hash,
        },
        UpdateExpression = "SET premiumPaidTime = :premiumPaidTime",
        ExpressionAttributeValues = {":premiumPaidTime": {"N" : str(premium_paid_time)}}
      )
      
      statusCode = 200

    except BaseException as error:
      print("An error ocurred: {} ".format(error))
      statusCode = 500
      
    body = {}
   
    return {
        'statusCode': statusCode,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        },
        'body': json.dumps(body),
    }
