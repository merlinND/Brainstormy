from neo4django.db import models
from nltk.corpus import wordnet as wn
import json

# ajout du chemin du corpus wordnet
nltk.data.path.append('/home/hh/Projets_informatique/fhacktory/Brainstormy/server/Brainstormy_app/nltk_data/')

id_counter=0
nodes=[]
text = nltk.Text(word.lower() for word in nltk.corpus.brown.words())
text.similar('woman')


syns = wn.synsets('car') #liste des synonymes
syns_names=[l.name for s in syns for l in s.lemmas] # parcours des noms -names- des racines -lemmas- des synonymes -syns- de car
list(set(syns_names)) # suppression des doublons

for name in syns_names:
    id_counter+=1
    d={ 'id': id_counter, 'word': name, 'edges': [] }
    nodes.append(d)

# conversion de la nodes -type list- en JSON
json_data = json.dumps(data)

##########################################################
# models

class Idea(models.NodeModel):
    word = models.StringProperty()
    age = models.IntegerProperty()

    friends = models.Relationship('self',rel_type='friends_with')

class Pet(models.NodeModel):
    owner = models.Relationship(Idea,
                                rel_type='owns',
                                single=True,
                                related_name='pets'
                               )

        
import nltk
nltk.data.path.append('/home/hh/Projets_informatique/fhacktory/Brainstormy/server/Brainstormy_app/nltk_data/')
text = nltk.Text(word.lower() for word in nltk.corpus.brown.words())

from cStringIO import StringIO
import sys

old_stdout = sys.stdout
sys.stdout = mystdout = StringIO()

text.similar('woman')

sys.stdout = old_stdout

mystdout.getvalue()
import StringIO, sys
from contextlib import contextmanager

@contextmanager
def redirected(out=sys.stdout, err=sys.stderr):
    saved = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = out, err
    try:
        yield
    finally:
        sys.stdout, sys.stderr = saved


def fun():
    runner = InteractiveConsole()
    while True:
        out = StringIO.StringIO()
        err = StringIO.StringIO()
        with redirected(out=out, err=err):
            out.flush()
            err.flush()
            code = raw_input()
            code.rstrip('\n')
            # I want to achieve the following
            # By default the output and error of the 'code' is sent to STDOUT and STDERR
            # I want to obtain the output in two variables out and err
            runner.push(code)
            output = out.getvalue()
        print output

from nltk.probability import FreqDist
from nltk import ContextIndex
from nltk import Text
from itertools import islice
from nltk.util import tokenwrap
import re

class MyText(Text):
    def similar(self, word, num=20):
        """
        Distributional similarity: find other words which appear in the
        same contexts as the specified word; list most similar words first.

        :param word: The word used to seed the similarity search
        :type word: str
        :param num: The number of words to generate (default=20)
        :type num: int
        :seealso: ContextIndex.similar_words()
        """
        ret_words=[]
        if '_word_context_index' not in self.__dict__:
            print('Building word-context index...')
            self._word_context_index = ContextIndex(self.tokens,
                                                    filter=lambda x:x.isalpha(),
                                                    key=lambda s:s.lower())
        word = word.lower()
        wci = self._word_context_index._word_to_contexts
        if word in wci.conditions():
            contexts = set(wci[word])
            fd = FreqDist(w for w in wci.conditions() for c in wci[w]
                          if c in contexts and not w == word)
            words = islice(fd.keys(), num)
            ret_words.append(tokenwrap(words))
            print(tokenwrap(words))
        else:
            print("No matches")
        return ret_words

text = MyText(word.lower() for word in nltk.corpus.brown.words())
val=text.similar('woman')



mystr = 'This is a string, with words!'
wordList = re.sub("[^\w]", " ",  mystr).split()
