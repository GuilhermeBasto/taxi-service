import json
import requests

URL = 'https://geocode.search.hereapi.com/v1/geocode'
apiKey = "ysgmX3EfwM5d3fd1K5kU1t2yeF0qq0yIKwP2LF_cMog"


def lambda_handler(event, context):
    response = {
        'statusCode': 401
    }

    q = event['location']

    if q != None and q != '':
        payload = {'q': q, "apiKey": apiKey}
        r = requests.get(URL, params=payload)
        body = r.json()

        response = {
            'statusCode': 200,
            'body': body
        }

    response['headers'] = {
        'Access-Control-Allow-Origin': '*',  # Required for CORS support to work
        # Required for cookies, authorization headers with HTTPS
        'Access-Control-Allow-Credentials': True
    }

    return response
