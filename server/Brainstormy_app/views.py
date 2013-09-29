import json
from django.shortcuts import render
from django.http import HttpResponse
import nltk
import re
from nltk.probability import FreqDist
from nltk import ContextIndex
from nltk import Text
from itertools import islice
from nltk.util import tokenwrap
from django.core.cache import cache
from django.core.cache import get_cache
import nltk.data
import urllib3
from urllib3 import PoolManager
from django.utils.html import strip_tags
import json
import urllib

def showsome(searchfor):
  query = urllib.urlencode({'q': searchfor})
  print '##############query ',query
  url = 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&%s' % query
  print '##############url ',url
  search_response = urllib.urlopen(url)
  print '##############search_response ',search_response
  search_results = search_response.read()
  print '##############search_results ',search_results
  results = json.loads(search_results)
  data = results['responseData']
  hits = data['results']
  print 'Top %d hits:' % len(hits)
  for h in hits: print ' ', h['url']
  
  return hits[0]['url']

#from models import Brainstorming
#from models import Idea

cache.set('id_counter', 0, 30000)

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

nltk.data.path.append('/home/hh/Projets_informatique/fhacktory/Brainstormy/server/Brainstormy_app/nltk_data/')



def query(request):
	max_value = 20
	id_counter=int(cache.get('id_counter'))
	if request.GET.get('max'):
		max_value = json.loads(request.GET['max'])
	if request.GET.get('json'):
		my_json = json.loads(request.GET['json']) # json decode
		my_json['edges'] = []

		# extraction des mots similaires
		url = showsome(my_json['word']+' wikipedia')
		my_json['word']=url.split('/')[-1]
		#url='http://en.wikipedia.org/wiki/'+my_json['word']
		#url=g.results[0].URL
		manager = PoolManager(10)
		r = manager.request('GET', url)
		wiki=""
		for match in re.findall(r'<p>(.*)</p>', r.data):
			wiki+=match+" "
		
		# supprimer les balises du texte
		text_1 = strip_tags(wiki)
		text_1 = re.sub("\[[1-9]+\]", "",  text_1)
		text_1 = re.sub(" (.){1,3} ", " ",  text_1)

		# generation du corpus
		text_1 = nltk.word_tokenize(text_1)

		text_2 = MyText(word.lower() for word in text_1)
		words = text_2.similar(my_json['word'], max_value)
		if not words:
			nodes=my_json
		else:
			wordList = re.sub("[^\w]", " ",  words[0]).split()
			if not my_json['id']:
				my_json['id']=id_counter
				id_counter+=1
				cache.incr('id_counter')
			current_id=my_json['id']
			nodes={'edges': [], 'newNodes': [], 'queryNode': my_json}
			nodes['queryNode']['id']=current_id
			for word in wordList:
				nodes['edges'].append({'to': id_counter, 'relevance': 0.2})
				nodes['newNodes'].append({'id': id_counter, 'parentId': current_id, 'relevance': 0.2, 'word': word, 'edges': [], 'depth': 1})
				id_counter+=1
				cache.incr('id_counter')

		response = HttpResponse(json.dumps(nodes)) # json encode
		response["Access-Control-Allow-Origin"] = "*"
		response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
		response["Access-Control-Max-Age"] = "1000"
		response["Access-Control-Allow-Headers"] = "*"
	else:
		response = HttpResponse('You submitted nothing!')
		response["Access-Control-Allow-Origin"] = "*"
		response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
		response["Access-Control-Max-Age"] = "1000"
		response["Access-Control-Allow-Headers"] = "*"
	return response
