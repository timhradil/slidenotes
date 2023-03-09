import os
import json
import boto3
import hashlib
import time
import stripe
from twilio.rest import Client

def getTwilioKeys():
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

    return json.loads(get_secret_value_response['SecretString'])

def getStripeKeys():
    secret_name = "StripeTestKeys"
    region_name = "us-west-2"
    session = boto3.session.Session()
    client = session.client(
      service_name='secretsmanager',
      region_name=region_name
    )

    get_secret_value_response = client.get_secret_value(
      SecretId=secret_name
    )

    return json.loads(get_secret_value_response['SecretString'])

# checkPhoneCode
def lambda_handler(event, context):
    print('received event: ')
    print(event)
    
    try:
      # Static Variables
      db_client = boto3.client('dynamodb')
      DYNAMODB_TABLE = os.environ['DYNAMODB_TABLE']

      body = json.loads(event['body'])
      phone_number = body['phoneNumber']
      phone_number_hash = hashlib.sha256(phone_number.encode('UTF-8')).hexdigest()
      otp = body['otp']

      # Check otp
      twilioKeys = getTwilioKeys()
      twilio_client = Client(twilioKeys['TwilioAccountSID'], twilioKeys['TwilioAuthToken'])
      verify = twilio_client.verify.services(twilioKeys['TwilioVerifySID'])
      try:
        result = verify.verification_checks.create(to=phone_number, code=otp)

        if result.status == 'pending':
          statusCode = 403
        else:
          response = db_client.get_item(
            TableName=DYNAMODB_TABLE,
            Key={
              'phoneNumberHash':{'S': phone_number_hash},
            },
            AttributesToGet=[
              'phoneNumberHash',
            ],
          )

          if 'Item' not in response:
            stripe.api_key = getStripeKeys()['api_key']
            customer = stripe.Customer.create()
            now = time.time()
            # Create DB Entry
            response = db_client.put_item(
              TableName=DYNAMODB_TABLE,
              Item={
                'phoneNumberHash':{'S': phone_number_hash},
                'stripeId':{'S': customer.id},
                'timeCreated':{'N': str(now)},
                'premiumPaidTime':{'N': str(now)}
              },
            )
      
          statusCode = 200
    
      except:
        statusCode = 401
 
    except BaseException as error:
      print("An error ocurred: {} ".format(error))
      statusCode = 500
   
    return {
        'statusCode': statusCode,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        },
        'body': json.dumps({}),
    }
