import os
import json
import boto3
from base64 import b64encode
from fpdf import FPDF
from unidecode import unidecode

# downloadNotes
def lambda_handler(event, context):
    print('received event:')
    print(event)

    # Static Variables
    db_client = boto3.client('dynamodb')
    DYNAMODB_TABLE = os.environ['DYNAMODB_TABLE']

    body = json.loads(event['body'])
    id = body['id']

    # Get notes text
    response = db_client.get_item(
      TableName=DYNAMODB_TABLE,
      Key={
        'id': {'S': id}
      },
      AttributesToGet=[
        's3key',
        'notes_text',
      ]
    )

    s3key = unidecode(response['Item']['s3key']['S'])
    notes_text = unidecode(response['Item']['notes_text']['S'])
   
    title_text = s3key.replace('.pptx','')

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Times', size=20)
    pdf.write(txt=title_text)
    pdf.set_font('Times', size=12)
    pdf.write(txt=notes_text)

    return {
        'isBase64Encoded': True,
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        },
        'body': b64encode(pdf.output()).decode('utf-8')
    }
