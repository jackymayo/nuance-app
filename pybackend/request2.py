import json
import requests
import codecs
import collections
from matplotlib import pyplot as plt
from sklearn.manifold import TSNE
import pandas
import re
import time
import gensim
import pickle
from mpl_toolkits.mplot3d import Axes3D
import csv


# body = open("cred.json")
# url = "https://nim-rd.nuance.mobi:9443/nina-webapi/DoSpeechRecognition"
# headers = {'Content-Type' : 'Application/JSON',
# 'nmaid' : 'Nuance_ConUHack2017_20170119_210049',
# 'nmaidkey' : '0d11e9c5b897eefdc7e0aad840bf4316a44ea91f0d76a2b053be294ce95c7439dee8c3a6453cf7db31a12e08555b266d54c2300470e4140a4ea4c8ba285962fd'}
#
# r = requests.post(url, headers=headers, data = body)
# print(r.text)

### Testing
#raw = r.text
raw = """I propose to consider the question, "Can machines think?" This should begin with
definitions of the meaning of the terms "machine" and "think." The definitions might be
framed so as to reflect so far as possible the normal use of the words, but this attitude is
dangerous, If the meaning of the words "machine" and "think" are to be found by
examining how they are commonly used it is difficult to escape the conclusion that the
meaning and the answer to the question, "Can machines think?" is to be sought in a
statistical survey such as a Gallup poll. But this is absurd. Instead of attempting such a
definition I shall replace the question by another, which is closely related to it and is
expressed in relatively unambiguous words."""


### splits returned string into words and computes metrics
# Remove punctuation except for apostrophe and make lowercase
text = re.sub(r'[^\w\s\']', '', raw)
text = text.lower()
words = text.split()

# Count words
counts = collections.Counter(words)
print(counts)

df = pandas.DataFrame.from_dict(counts, orient='index')
# df.plot(kind='bar')
# plt.show()


# Save everything
# df.to_csv("WordCount_" + time.strftime("%d%m%y_%H%M") + ".csv")
# with open("RawText_" + time.strftime("%d%m%y_%H%M") + ".txt", "w") as text_file:
#     text_file.write(raw)



### Get synonyms for a word
### https://words.bighugelabs.com/api.php
# def get_synonyms(word):
#     r = requests.get("http://words.bighugelabs.com/api/2/f2c786918d5b0a290582a98495f63a6d/" + word + "/json")
#     #print(r.json())
#     return r.json()

#get_synonyms("small")


### Use word2vec to get 'thought vectors' for words
# load the Google's pre-trained model (too big for GitHub)
# model = gensim.models.Word2Vec.load_word2vec_format('GoogleNews-vectors-negative300.bin', binary=True)
# word_vectors = []
# words = []
## Get the word vectors for the words used in the text
# for word in list(df.index):
#     try:
#         word_vectors.append(model[word])
#         words.append(word)
#     except KeyError:
#         print("not found", word)
#         pass
#
# df_word = pandas.DataFrame(word_vectors)
# df_word.index = words

# save word vectors for later use
# with open('word_vectors.p', 'wb') as fp:
#    pickle.dump(df_word, fp)

# load saved word vectors
with open('word_vectors.p', 'rb') as fp:
    df_word = pickle.load(fp)

#print(df_word)

# Reduce the dimensions to only 2d (or 3d, change n_componenents)
model_tsne = TSNE(n_components=2, random_state=1)
dim_reduced = model_tsne.fit_transform(df_word)
print(dim_reduced)

tsne_json = []
for label, x, y in zip(df_word.index, dim_reduced[:,0], dim_reduced[:, 1]):
    tsne_json.append({"word" : label, "x": x, "y": y})

with open('tsne.json', 'w') as f:
    json.dump(tsne_json, f)

print(tsne_json)

# with open('tsne.csv', 'w') as fp:
#     writer = csv.writer(fp, delimiter=',')
#     for line in zip(df_word.index, dim_reduced[:,0], dim_reduced[:, 1]):
#         writer.writerow(line)

#Plot the dimension-reduced vectors in 2d
# plt.scatter(dim_reduced[:,0], dim_reduced[:,1])
# for label, x, y in zip(df_word.index, dim_reduced[:,0], dim_reduced[:, 1]):
#    plt.annotate(label, xy=(x, y), xytext=(0, 0), textcoords='offset points')
# plt.show()

