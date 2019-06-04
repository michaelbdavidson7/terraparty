import urllib.error
import urllib.request
from bs4 import BeautifulSoup
import os
import json
import time
print("hellow world")

# import urllib2

docsLinksFileName = "tfDocsLinks.txt"
docsLinksFileNameParsed = "tfDocsLinksParsed.txt"
resourcesOutputFile = "resourcesOutputFile.json"
objectToExport = []


# todo get all the sidebar resources links to go through
def getAllLinks():
    url = "https://www.terraform.io/docs/providers/aws/index.html"

    content = urllib.request.urlopen(url).read()

    soup = BeautifulSoup(content, features="html.parser")
    # print(soup.prettify)
    SymbolExcludeArray = ["/", "#", "None"]
    tfPageAllLinks = soup.find_all("a")

    if os.path.isfile(docsLinksFileName):
        os.remove(docsLinksFileName)

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

        if os.path.isfile(docsLinksFileNameParsed):
            os.remove(docsLinksFileNameParsed)

        with open(docsLinksFileNameParsed, "a") as parsedListFile:
            for line in lines:
                # data resources: line.startswith('/docs/providers/aws/d/')
                if line.startswith('/docs/providers/aws/r/'):
                    validLinks.append(line)
                    print(line, file=parsedListFile)

    # print(validLinks)


def getResourceWebpages():
    jsonOutput = []

    if os.path.isfile(resourcesOutputFile):
        os.remove(resourcesOutputFile)
    with open(resourcesOutputFile, 'a') as jsonOutputFile:
        with open(docsLinksFileNameParsed) as f:
            data = f.read()
            lines = data.split('\n')
            for lineno, line in enumerate(lines):
                print('#' + str(lineno + 1) + " of " + str(len(lines)))

                if line:
                    url = "https://www.terraform.io" + line
                    if '/docs/providers/aws/r/' in url:
                        docType = 'awsResource'
                    elif '/docs/providers/aws/d/' in url:
                        docType = 'awsDataSource'
                    else:
                        docType = ''
                    print('url: ', url)
                    resourceObj = {'id': lineno + 1, 'type': '',
                                   'properties': [], 'docsUrl': url, 'docType': docType}

                    # http request get the website
                    content = urllib.request.urlopen(url).read()
                    soup = BeautifulSoup(content, features="html.parser")

                    # get resource name (which is the resource type)
                    resourceNameBaseContentList = soup.find(
                        id='inner').h1.contents
                    lastResourceIndex = len(resourceNameBaseContentList) - 1
                    resourceName = resourceNameBaseContentList[lastResourceIndex]
                    if '\n' in resourceName:
                        resourceName = resourceName.split(
                            '\n')[1]  # there's two \ns
                        if ': ' in resourceName:
                            resourceName = resourceName.split(': ')[1]
                    
                    resourceNameType = str(type(resourceName))
                    if 'Tag' in resourceNameType:
                        resourceName = resourceName.text

                    resourceObj['type'] = resourceName
                    print('resourceName', resourceName)

                    # get all the properties
                    ul = soup.find(id='inner').ul.find_all('li')
                    for li in ul:
                        # print(li)
                        strLi = str(li)
                        propertyObject = {'name': "",
                                          'required': False, 'default': ''}
                        if li.code:
                            propertyObject['name'] = li.code
                            if li.code.contents:
                                propertyObject['name'] = li.code.contents[0]
                        else:
                            propertyObject['name'] = li
                        if '(Required)' in strLi:
                            print(propertyObject['name'] + ' is required')
                            propertyObject['required'] = True
                        if '(Default: ' in strLi:
                            propertyObject['default'] = strLi.split(
                                '(Default')[1]
                        if ')' in strLi:
                            propertyObject['description'] = strLi.split(')')[1]
                            if '</li>' in propertyObject['description']:
                                propertyObject['description'] = propertyObject['description'].split(
                                    '</li>')[0]
                        for prop in propertyObject:
                            propType = str(type(prop))
                            if 'Tag' in propType:
                                propertyObject[prop] = prop.text
                        resourceObj['properties'].append(propertyObject)
                        
                    resourceObjJson = json.dumps(resourceObj) + ','
                    print(resourceObjJson, file=jsonOutputFile)
                    time.sleep(2)


getResourceWebpages()
