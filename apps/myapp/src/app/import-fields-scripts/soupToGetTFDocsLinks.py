import urllib.error
import urllib.request
from bs4 import BeautifulSoup
import os
import json
print("hellow world")

# import urllib2

docsLinksFileName = "tfDocsLinks.txt"
docsLinksFileNameParsed = "tfDocsLinksParsed.txt"
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


def improveLinks():
    validLinks = []
    with open(docsLinksFileName) as f:
        data = f.read()
        lines = data.split('\n')

        with open(docsLinksFileNameParsed, "a") as parsedListFile:
            for line in lines:
                if line.startswith('/docs/providers/aws/d/') or line.startswith('/docs/providers/aws/r/'):
                    validLinks.append(line)
                    print(line, file=parsedListFile)

    print(validLinks)


def getResourceWebpages():
    with open(docsLinksFileNameParsed) as f:
        data = f.read()
        lines = data.split('\n')
        for line in lines:
            url = "https://www.terraform.io" + line
            print('url: ', url)
            content = urllib.request.urlopen(url).read()

            soup = BeautifulSoup(content, features="html.parser")
            ul = soup.find(id='inner').ul.find_all('li')
            for li in ul:
                # print(li)
                strLi = str(li)
                propertyObject = {'name':"", 'required': False, 'default': ''}
                propertyObject['name'] = li.code.contents[0]
                if '(Required)' in strLi:
                    print(propertyObject['name'] + ' is required' )
                    propertyObject['required'] = True
                if '(Default: ' in strLi:
                    propertyObject['default'] = strLi.split('(Default')[1]
                propertyObject['description'] = strLi.split(')')[1].split('</li>')[0]
                propertyObjectJson = json.dumps(propertyObject)
                print(propertyObjectJson)
            # print(ul)
            # for u in ul:
            #     print(u)
            return soup


def parseContent(content):
    newProperty = {
        "key": '',
        "value": '',
        "dataType": "",
        "required": False,
        "docsUrl": ""
    }


class TFResource:
    type = ""
    docsUrl = ""
    Properties = []

# class TFProperty:


getResourceWebpages()
