import json
import boto3
import uuid
import logging


transcribe = boto3.client('transcribe')


def lambda_handler(event, context):
    job_id = str(uuid.uuid4())

    destination_uri = None

    try:
        destination_uri = event['url']
    except:
        response = {
            'statusCode': 401,
            'message': json.dumps("missing audio url")
        }

    if destination_uri != None and destination_uri != '':
        # start transcribe job
        transcribe.start_transcription_job(TranscriptionJobName=job_id, Media={
            'MediaFileUri': destination_uri}, MediaFormat='wav', LanguageCode='pt-PT')
        status = transcribe.get_transcription_job(TranscriptionJobName=job_id)[
            'TranscriptionJob']['TranscriptionJobStatus']
        response = {
            'statusCode': 200,
            'body': {'jobId': job_id, "status": str(status)}
        }

    response['headers'] = {
        'Access-Control-Allow-Origin': '*',  # Required for CORS support to work
        # Required for cookies, authorization headers with HTTPS
        'Access-Control-Allow-Credentials': True,
    }

    return response
