import os
import json
import boto3
import hashlib
import stripe

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

      stripe.api_key = getStripeKeys()['api_key']

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

      session = stripe.checkout.Session.create(
        customer=customer_id,
        line_items=[{
          "price": "price_1Mf5lMLmvir5itla2AHYEaU1", 
          "quantity": 1
        }],
        mode="subscription",
        success_url=return_url,
        cancel_url=return_url,
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
