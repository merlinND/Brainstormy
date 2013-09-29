from mongoengine import *
from fhacktory.settings import DBNAME

connect(DBNAME)

class Brainstorming(Document):
    title = StringField(max_length=120, required=True)
    last_update = DateTimeField(required=True)

class Idea(Document):
    word = StringField(max_length=80, required=True)
    relevance = IntegerField(required=True)
