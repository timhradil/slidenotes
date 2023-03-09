import os
import json
import boto3
import hashlib
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

      body = json.loads(event['body'])
      return_url = body['returnUrl']
      phone_number = body['phoneNumber']
      phone_number_hash = hashlib.sha256(phone_number.encode('UTF-8')).hexdigest()
      response = db_client.get_item(
            TableName=DYNAMODB_TABLE,
            Key={
              'phoneNumberHash':{'S': phone_number_hash},
            },
            AttributesToGet=[
              'stripeId',
            ],
          )
      customer_id = response['Item']['stripeId']['S']

      session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url,
      )

      body['url'] = session.url
      
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
