import csv
import pwd
import json
import requests
import codecs
import collections
import re

from flask import Flask, url_for
from flask import json, request
from flask_cors import CORS, cross_origin
app = Flask(__name__)
CORS(app)

@app.route('/test', methods=["POST"])
def synclick():
    posted = request.get_data()
    request_json = request.json
    print(request_json)
    word = request_json['data']
    print(word)
    syns = get_synonyms(word)
    print(syns)
    return json.dumps(syns)

@app.route('/wcount', methods=["POST"])
def wcount():
    posted = request.get_data()
    request_json = request.json
    selection = request_json['data']
    raw = getraw(int(selection))
    text = re.sub(r'[^\w\s\']', '', raw)
    text = text.lower()
    words = text.split()
    # Count words
    counts = collections.Counter(words)
    countskeys = counts.keys()

    arr = []
    for x in countskeys:
        arr.append({"Letter": x, "Freq": counts[x]})
    newarr = sorted(arr, key=lambda k: k['Freq'])
    print(newarr)

    with open('wcount'+ selection+ '.json', 'w') as f:
        json.dump(newarr, f)
    return json.dumps(counts)

@app.route('/scatterpairs', methods=["POST"])
def scatterpairs():
    posted = request.get_data()
    request_json = request.json
    selection = request_json['data']

    with open('tsne' + str(int(selection)) + '.json', 'r') as f:
        data = json.load(f)

    return json.dumps(data)

@app.route('/wordlist', methods=["POST"])
def wordlist():
    posted = request.get_data()
    request_json = request.json
    selection = request_json['data']
    raw = getraw(int(selection))
    text = re.sub(r'[^\w\s\']', '', raw)
    text = text.lower()
    words = text.split()
    return json.dumps(words)

def get_synonyms(word):
    r = requests.get("http://words.bighugelabs.com/api/2/f2c786918d5b0a290582a98495f63a6d/" + word + "/json")
    return r.json()

def getraw(a):
    with open('text.json') as data_file:
        data = json.load(data_file)
        print(data['test'][0]['0'])
    return data['test'][0][str(int(a)-1)]



if __name__ == '__main__':
    app.run()
