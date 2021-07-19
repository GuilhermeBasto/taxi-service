import jwt
import json

password = 'Very long, very difficult indeed! It would take ages to attack this very long string. Now the numbers that were missing so far: 34719108435'


def lambda_handler(event, context):
    if 'token' in event:
        result = jwt.decode(event['token'],
                            password, algorithms=['HS256'])

        if 'username' in result and 'password' in result and result['username'] == result['password']:
            return generatePolicy('user', 'Allow', event['methodArn'])
        else:
            return generatePolicy('user', 'Deny', event['methodArn'])
    else:
        return 'Unauthorized'


# Help function to generate an IAM policy
def generatePolicy(principalId, effect, resource):
    authResponse = {}

    authResponse['principalId'] = principalId
    if effect and resource:
        policyDocument = {}
        policyDocument['Version'] = '2012-10-17'
        policyDocument['Statement'] = []
        statementOne = {}
        statementOne['Action'] = 'execute-api:Invoke'
        statementOne['Effect'] = effect
        statementOne['Resource'] = resource
        policyDocument['Statement'] = [statementOne]
        authResponse['policyDocument'] = policyDocument

    # Optional output with custom properties of the String, Number or Boolean type.
    # authResponse['context'] = {
    #     "stringKey": "stringval",
    #     "numberKey": 123,
    #     "booleanKey": True
    # };
    return authResponse
