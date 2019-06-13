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
resourcesOutputFile = "resourcesOutputFile3.json"
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

class PropertyObject:
    name= ""
    required= False
    default= ''
    description= ''
    specialNotes= ''
    elementType= ''

def getResourceWebpages():
    jsonOutput = []
    failureList = []

    if os.path.isfile(resourcesOutputFile):
        os.remove(resourcesOutputFile)
    with open(resourcesOutputFile, 'a') as jsonOutputFile:
        with open(docsLinksFileNameParsed) as f:
            data = f.read()
            lines = data.split('\n')
            for lineno, line in enumerate(lines):
                if lineno > 10 and lineno < 20:
                    return

                try:
                    print('#' + str(lineno + 1) + " of " + str(len(lines)))

                    if not line:
                        raise ValueError("Line doesn't exist")

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
                    lastResourceIndex = len(
                        resourceNameBaseContentList) - 1
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
                    innerElements = soup.find(id='inner').find(
                        id='argument-reference').find_next_siblings()
                    for el in innerElements:

                        propertyObject = {'name': "", 'required': False,
                                          'default': '', 'description': '', 'specialNotes': '', 'elementType': ''}

                        # print(el, type(el), el.name, el.attrs)
                        # start at argument reference id and end at attribute reference or import
                        if 'id' in el.attrs and (el.attrs['id'] == 'attribute-reference' or el.attrs['id'] == 'attributes-reference' or el.attrs['id'] == 'import'):
                            print('FOUND IT - ' + el.attrs['id'])
                            break
                        if 'id' in el.attrs:
                            print('id: ' + el.attrs['id'])
                        # grab the next div or hx element to see if it has notes for a li
                        if el.name.startswith('h') or el.name == 'div' or el.name == 'p':
                            propertyObject = parseDisplayElements(el, propertyObject)
                            resourceObj['properties'].append(propertyObject)
                            continue
                        if el.name == 'ul':
                            for li in el.find_all('li'):
                                if len(li.find_all('ul')) > 0:
                                    print('UL WITHIN A UL')
                                    # TODO: get the text of the li and add it as a property
                                    innerUls = li.find_all('ul')
                                    for innerUl in innerUls:
                                        for li2 in innerUl.find_all('li'):
                                            propertyObject = parseLIElements(li2, propertyObject)
                                            resourceObj['properties'].append(propertyObject)
                                else:
                                    propertyObject = parseLIElements(li, propertyObject)
                                    resourceObj['properties'].append(propertyObject)
                                    # print('li: ', li)
                                    # print(json.dumps(propertyObject))
                        # go through li elements and add them to the properties array
                        # add next div if it has notes for this one

                        #     print('ul: ' + el.text)
                        # if el.name == 'li':
                            # skip since we just went thru it
                        # if el.name == ''
                        # end at attribute
                        # if el.name == 'ul':
                        # if el.Tag == 'ul':
                        #     print(el, el.Tag)
                        # .find_all('ul').find_all('li')

                    resourceObjJson = json.dumps(resourceObj) + ','
                    print(resourceObjJson, file=jsonOutputFile)
                    time.sleep(2)
                except Exception as e:
                    print(e)
                    with open('resourceOutputFailures.txt', 'a') as resourceOutputFailuresFile:
                        print(e, file=resourceOutputFailuresFile)
                        failMsg = 'Failed on ' + \
                            resourceObj['type'] + \
                            ' - full resource: ' + str(resourceObj)
                        print(failMsg, file=resourceOutputFailuresFile)
                        failureList.append(failMsg)
        print('failure list: ' + str(failureList))


def parseDisplayElements(el, propertyObject):
    propertyObject = {'name': "", 'required': False, 'default': '', 'description': '', 'specialNotes': '', 'elementType': ''}
    propertyObject['elementType'] = el.name
    propertyObject['name'] = el.attrs['id'] if 'id' in el.attrs else ''
    propertyObject['description'] = el.contents[len(el.contents) - 1]
    return propertyObject

def parseLIElements(li, propertyObject):

    # new up prop object again because it only gets newed up on on the next item
    propertyObject = {'name': "", 'required': False, 'default': '', 'description': '', 'specialNotes': '', 'elementType': ''}
    strLi = str(li)
    # if type(strLi) is not 'string':

    propertyObject['elementType'] = 'li'

    if li.code:
        propertyObject['name'] = li.code
        if li.code.contents:
            propertyObject['name'] = li.code.contents[0]
    else:
        propertyObject['name'] = li.string
    if '(Required)' in strLi:
        # print(propertyObject['name'] + ' is required')
        propertyObject['required'] = True

    # print('type li', type(li), 'li name', li.name)
    # print(strLi)
    # liWithoutTitles = li
    # del liWithoutTitles.contents[0]
    # del liWithoutTitles.contents[0]
    descStr = ""
    if li.contents[0].name == 'a':
        for index, c in enumerate(li.contents):
            if index > 1:
                descStr = descStr + str(c)
        print('yes its A', len(li.contents))
    else:
        print('no', str(li))
        descStr = strLi
    
    # format description string a bit
    if descStr.startswith(' - '):
        descStr = descStr.split(' - ')[1]
    propertyObject['description'] = descStr

    for prop in propertyObject:
        propType = str(type(prop))
        if 'Tag' in propType:
            propertyObject[prop] = str(prop.text)
            print('Converted ' + propertyObject[prop] + ' to a string')

    return propertyObject


getResourceWebpages()
