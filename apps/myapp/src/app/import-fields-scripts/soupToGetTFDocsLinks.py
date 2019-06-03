print("hellow world")
import os

import os
from bs4 import BeautifulSoup
# import urllib2
import urllib.request, urllib.error

docsLinksFileName = "tfDocsLinks.txt"
objectToExport = []


# todo get all the sidebar resources links to go through 
def getAllLinks():
    url = "https://www.terraform.io/docs/providers/aws/index.html"

    content = urllib.request.urlopen(url).read()

    soup = BeautifulSoup(content, features="html.parser")
    # print(soup.prettify)
    SymbolExcludeArray = ["/", "#", "None"]
    tfPageAllLinks = soup.find_all("a")

    with open(docsLinksFileName, "a") as f:
        for link in tfPageAllLinks:
            linkConverted = str(link.get('href'))
            if linkConverted not in SymbolExcludeArray and linkConverted[0] != '#':
                print(link.get('href'), file=f)

        # print("Hello stackoverflow!", file=f)
        # print("I have a question.", file=f)
    # os.startfile("./TestFile.txt", "print")

    # print(soup.prettify())

def goThroughLinks():
    validLinks = []
    with open(docsLinksFileName) as f:
        data = f.read()
        lines = data.split('\n')
        for line in lines:
            if line.startswith('/docs/'):
                validLinks.append(line)


def parseContent(content):
    newProperty = {
      "key": '',
      "value": '',
      "dataType": "",
      "required":False,
      "docsUrl":""
      }

class TFResource:
    type = ""
    docsUrl = ""
    Properties = []

# class TFProperty:
    
        
# goThroughLinks()