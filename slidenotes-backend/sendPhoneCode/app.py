import os
import json
import boto3
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

# sendPhoneCode
def lambda_handler(event, context):
    print('received event:')
    print(event)
   
    statusCode = 200
    try:
      body = json.loads(event['body'])
      phone_number = body['phoneNumber']

      # Send otp to phone
      twilioKeys = getTwilioKeys()
      twilio_client = Client(twilioKeys['TwilioAccountSID'], twilioKeys['TwilioAuthToken'])
      verify = twilio_client.verify.services(twilioKeys['TwilioVerifySID'])
      verify.verifications.create(to=phone_number, channel='sms')
  
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
