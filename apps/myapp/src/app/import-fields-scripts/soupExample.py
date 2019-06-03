print("hellow world")
import os

# os.startfile("./TestFile.txt", "print")
import os
from bs4 import BeautifulSoup
# import urllib2
import urllib.request, urllib.error




# todo get all the sidebar resources links to go through 

url = "https://www.pythonforbeginners.com"

content = urllib.request.urlopen(url).read()

soup = BeautifulSoup(content, features="html.parser")
print(soup.title.string)

# print(soup.prettify())
print("test")