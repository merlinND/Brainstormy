#!/usr/bin/env python
# -*- coding:utf-8 -*- 
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
import operator
from urllib3 import PoolManager
from django.utils.html import strip_tags
#from models import Brainstorming
#from models import Idea

cache.set('id_counter', 0, 30000)

def removeNonAscii(s):return "".join(i for i in s if ord(i)<128)

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
		Distributional similarity:find other new_ideas which appear in the
		same contexts as the specified word; list most similar new_ideas first.

		:param word:The word used to seed the similarity search
		:type word:str
		:param num:The number of new_ideas to generate (default=20)
		:type num:int
		:seealso:ContextIndex.similar_new_ideas()
		"""
		ret_new_ideas=[]
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
			new_ideas = islice(fd.keys(), num)
			ret_new_ideas.append(tokenwrap(new_ideas))
			print(tokenwrap(new_ideas))
		else:
			print("No matches")
		return ret_new_ideas

nltk.data.path.append('/home/hh/Projets_informatique/fhacktory/Brainstormy/server/Brainstormy_app/nltk_data/')

def query(request):
	max_ideas = 20 # Nombre maximum de mots (idées pour brainstormer) générés
	word_list = []

	if request.GET.get('max'):
		# Le client spécifie le nombre d'idées voulues
		max_ideas = json.loads(request.GET['max'])

	if request.GET.get('json'):
		idea = json.loads(request.GET['json'])# Décodage de l'idée (mot) envoyée par le client
		idea['word'] = idea['word'].lower()

		# Récupération du lien wikipédia à partir du mot reçu
		url = getgooglelinks(idea['word']+' wikipedia')[0]
		print url
		old_word = idea['word']
		print '#######################json',idea['word']

		# Extraction de la page wikipédia
		manager = PoolManager(10)
		r = manager.request('GET', url)
		wiki_text = re.findall(r'<p>(.*)</p>', r.data)
		wiki_text = ''.join(wiki_text)
		wiki_word = {}
		for match in re.findall(r'>(\w{3,20})</a>', wiki_text):
			if match.lower() != idea['word']:
				if match.lower() in wiki_word.keys():
					wiki_word[match.lower()] += 1
				else:
					wiki_word[match.lower()] = 1
		word_list = dict(sorted(wiki_word.iteritems(), key=operator.itemgetter(1), reverse=True)[:8]).keys()
		id_counter = int( cache.get('id_counter') )# identifiant pour la prochaine idée
		if not idea['id']:
			idea['id'] = id_counter
			id_counter += 1
			cache.incr('id_counter')

		current_idea_id = idea['id']
		idea['word'] = old_word
		nodes = {'edges':[], 'newNodes':[], 'queryNode':idea}
		for word in word_list:
			nodes['edges'].append( {'to':id_counter, 'relevance':0.8} )
			if 'depth' in idea:
					nodes['newNodes'].append({'id':id_counter, 'parentId':current_idea_id, 'relevance':0.8, 'word':word, 'edges':[], 'depth':idea['depth']+1})
			else:
				nodes['newNodes'].append({'id':id_counter, 'parentId':current_idea_id, 'relevance':0.8, 'word':word, 'edges':[], 'depth':1})
			id_counter += 1
			cache.incr('id_counter')

		response = HttpResponse(json.dumps(nodes)) # encode les nouveaux noeuds en JSON
		response["Access-Control-Allow-Origin"] = "*"
		response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
		response["Access-Control-Max-Age"] = "1000"
		response["Access-Control-Allow-Headers"] = "*"
	else:
		response = HttpResponse('Your request is invalid')
		response["Access-Control-Allow-Origin"] = "*"
		response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
		response["Access-Control-Max-Age"] = "1000"
		response["Access-Control-Allow-Headers"] = "*"
	return response
