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
import urllib2
from urllib3 import PoolManager
from django.utils.html import strip_tags
#from models import Brainstorming
#from models import Idea

cache.set('id_counter', 0, 30000)



def getgoogleurl(search,siteurl=False):
	if siteurl==False:
		return 'http://www.google.com/search?q='+urllib2.quote(search)+'&oq='+urllib2.quote(search)
	else:
		return 'http://www.google.com/search?q=site:'+urllib2.quote(siteurl)+'%20'+urllib2.quote(search)+'&oq=site:'+urllib2.quote(siteurl)+'%20'+urllib2.quote(search)

def getgooglelinks(search,siteurl=False):
	#google returns 403 without user agent
	headers = {'User-agent':'Mozilla/11.0'}
	req = urllib2.Request(getgoogleurl(search,siteurl),None,headers)
	site = urllib2.urlopen(req)
	data = site.read()
	site.close()

	#no beatifulsoup because google html is generated with javascript
	start = data.find('<div id="res">')
	end = data.find('<div id="foot">')
	if data[start:end]=='':
			#error, no links to find
			return False
	else:
		links =[]
		data = data[start:end]
		start = 0
		end = 0        
		while start>-1 and end>-1:
			#get only results of the provided site
			if siteurl==False:
					start = data.find('<a href="/url?q=')
			else:
				start = data.find('<a href="/url?q='+str(siteurl))
			data = data[start+len('<a href="/url?q='):]
			end = data.find('&amp;sa=U&amp;ei=')
			if start>-1 and end>-1: 
				link =  urllib2.unquote(data[0:end])
				data = data[end:len(data)]
				if link.find('http')==0:
					links.append(link)
		return links

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


def removeNonAscii(s): return "".join(i for i in s if ord(i)<128)

def query(request):
	max_value = 20
	id_counter=int(cache.get('id_counter'))
	if request.GET.get('max'):
		max_value = json.loads(request.GET['max'])
	if request.GET.get('json'):
		# decodage du json
		my_json = json.loads(request.GET['json'])
		my_json['edges'] = []

		# recupration du lien wikipedia
		url = getgooglelinks(my_json['word']+' wikipedia')[0]
		print url
		old_json=my_json['word']
		my_json['word']=url.split('/')[-1]
		print '#######################json',my_json['word']

		# extraction des mots similaires
		manager = PoolManager(10)
		r = manager.request('GET', url)
		wiki=""
		for match in re.findall(r'<p>(.*)</p>', r.data):
			wiki+=match+" "

		# supprimer les balises du texte
		text_1 = strip_tags(wiki)
		text_1 = re.sub("\[[1-9]+\]", "",  text_1)
		text_1 = removeNonAscii(text_1)

		# generation du corpus
		text_1 = nltk.word_tokenize(text_1)

		text_1 = MyText(word.lower() for word in text_1)
		words = text_1.similar(my_json['word'], max_value)
		print '#######################words ',words
		if not words:
			my_json['word']=old_json
			nodes=my_json
		else:
			wordList = re.sub("[^\w]", " ",  words[0]).split()
			if not my_json['id']:
				my_json['id']=id_counter
				id_counter+=1
				cache.incr('id_counter')
			current_id=my_json['id']
			my_json['word']=old_json
			print '#######################json',my_json['word']
			nodes={'edges': [], 'newNodes': [], 'queryNode': my_json}
			nodes['queryNode']['id']=current_id
			for word in wordList:
				nodes['edges'].append({'to': id_counter, 'relevance': 0.8})
				nodes['newNodes'].append({'id': id_counter, 'parentId': current_id, 'relevance': 0.8, 'word': word, 'edges': [], 'depth': 1})
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
