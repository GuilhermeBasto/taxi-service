import json
import requests
import flexpolyline as fp


URL = 'https://router.hereapi.com/v8/routes'
apiKey = "ysgmX3EfwM5d3fd1K5kU1t2yeF0qq0yIKwP2LF_cMog"

# <latitude>,<longitude>


def lambda_handler(event, context):
    route = {}
    response = {
        'statusCode': 401
    }

    origin = event['origin']
    destination = event['destination']

    if origin != None and origin != '' and destination != None and destination != '':
        payload = {'transportMode': 'car', 'origin': origin,
                   'destination': destination, 'return': 'polyline,elevation', 'apiKey': apiKey}

        r = requests.get(URL, params=payload)

        body = r.json()

        # get encodeded route from polyline field in response
        p = body['routes'][0]['sections'][0]['polyline']

        route = fp.decode(p)

    response = {
        'statusCode': 200,
        'body': route
    }

    response['headers'] = {
        'Access-Control-Allow-Origin': '*',  # Required for CORS support to work
        # Required for cookies, authorization headers with HTTPS
        'Access-Control-Allow-Credentials': True,

    }

    return response
