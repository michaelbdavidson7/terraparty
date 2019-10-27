import urllib.error
import urllib.request
from bs4 import BeautifulSoup
import os
import json
import time
import datetime

now = datetime.datetime.now()

# Settings
# Change these for different providers, as well as the web parser below
providerName = "do"
url = "https://www.terraform.io/docs/providers/"+providerName+"/index.html"

soupedDocsLinksFolder = "souped-documentation-links"
soupedProviderOutputsFolder = "souped-provider-outputs"
soupedProviderFailuresFolder = "souped-provider-failures"

docsLinksFileName = soupedDocsLinksFolder + "/" + providerName + "_tfDocsLinks.txt"
docsLinksFileNameParsed = soupedDocsLinksFolder + "/" +  providerName + "_tfDocsLinksParsed.txt"
resourcesOutputFile = soupedProviderOutputsFolder + "/" + providerName + "_resourcesOutputFile.json"
resourceOutputFailuresFileName = soupedProviderFailuresFolder + "/" + providerName + "_resourceOutputFailures.txt"
objectToExport = []

def main():
    print("running program ..")
    # config = get_config(CONFIG_FILE_PATH)
    # providers = [Provider(**x, base_url=config['base_url']) for x in config['providers']]
    # providers[0].get_resource_pages()
    # getAllLinks()
    # getResourceWebpages()
    getAllProviderLinks()

def getAllProviderLinks():
    allProvidersUrl = "https://www.terraform.io/docs/providers/index.html"
    allProvidersObjList = []
    
    content = urllib.request.urlopen(allProvidersUrl).read()

    soup = BeautifulSoup(content, features="html.parser")
    providersSoup = soup.find(id='inner').find_all("div")[0].find_all("ul")[0].find_all('li')
    if len(providersSoup) < 100:
        raise ValueError('Soup is looking in the wrong area of the providers page for the providers')
    print(providersSoup)
    for listItem in providersSoup:
        providerName = listItem.find_all('a')[0].contents[0]
        providerLink = listItem.find_all('a')[0].get('href')
        providerObj = {"providerName": providerName, "providerLink": providerLink, "lastProviderListQuery": str(now)}
        print('listItem', type(listItem), providerObj)
        allProvidersObjList.append(providerObj)


# todo get all the sidebar resources links to go through
def getAllLinks():

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
    improveLinks()


def improveLinks():
    validDocsLinksList = []
    with open(docsLinksFileName) as f:
        data = f.read()
        lines = data.split('\n')

        if os.path.isfile(docsLinksFileNameParsed):
            os.remove(docsLinksFileNameParsed)

        with open(docsLinksFileNameParsed, "a") as parsedListFile:
            lines = list(dict.fromkeys(lines))
            for line in lines:
                # data resources: line.startswith('/docs/providers/aws/d/')
                if line.startswith('/docs/providers/'+ providerName + '/r/'):
                    validDocsLinksList.append(line)
                    print(line, file=parsedListFile)

def getResourceWebpages():
    # jsonOutput = []
    failureList = []

    if os.path.isfile(resourcesOutputFile):
        os.remove(resourcesOutputFile)
    with open(resourcesOutputFile, 'a') as jsonOutputFile:
        with open(docsLinksFileNameParsed) as f:
            # open the array 
            print("[", file=jsonOutputFile)

            data = f.read()
            lines = data.split('\n')

            # remove the last list item, which is a blank created from the \n on the last line
            lines.pop()

            for lineno, line in enumerate(lines):
                try:
                    linenoStr = str(lineno + 1)
                    totalLinesStr = str(len(lines))
                    print('#' + linenoStr + " of " + totalLinesStr)

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

                        propertyObject = {'name': "", 'description': '', 'elementType': ''}

                        # print(el, type(el), el.name, el.attrs)
                        # start at argument reference id and end at attribute reference or import
                        if 'id' in el.attrs and (el.attrs['id'] == 'attribute-reference' or el.attrs['id'] == 'attributes-reference' or el.attrs['id'] == 'import'):
                            print('FOUND AN ELEMENT ID TO EXIT THE RESOURCE - ' + el.attrs['id'])
                            break
                        if 'id' in el.attrs:
                            print('id: ' + el.attrs['id'])
                        # grab the next div or hx element to see if it has notes for a li
                        if el.name.startswith('h') or el.name == 'div' or el.name == 'p':
                            propertyObject = parseDisplayElements(el, propertyObject)
                            resourceObj['properties'].append(propertyObject)
                            continue
                        if el.name == 'ul':
                            for li in el.find_all('li', recursive=False):
                                if len(li.find_all('ul')) > 0:
                                    print('UL WITHIN A UL')
                                    # Get the text of the li and add it as a property
                                    print('list description - li.contents[0]', li.contents[0])
                                    if type(li.contents[0].name) != 'ul':
                                        liDescriptiveStr = str(li.contents[0])
                                        propertyObject = {'name': 'list description', 'description': liDescriptiveStr, 'elementType': 'p'}
                                        resourceObj['properties'].append(propertyObject)
                                        propertyObject = {'name': "", 'description': '',  'elementType': ''}
                                    
                                    innerUls = li.find_all('ul')
                                    for innerUl in innerUls:
                                        # print(str(innerUl))
                                        for li2 in innerUl.find_all('li'):
                                            propertyObject = parseLIElements(li2, propertyObject, 2)
                                            resourceObj['properties'].append(propertyObject)
                                else:
                                    propertyObject = parseLIElements(li, propertyObject, 1)
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

                    resourceObjJson = json.dumps(resourceObj) 
                    if int(linenoStr) == int(totalLinesStr):
                        print('skipping comma')
                    else:
                        resourceObjJson = resourceObjJson + ','
                    print(resourceObjJson, file=jsonOutputFile)
                    time.sleep(1)
                except Exception as e:
                    print(e)
                    with open(resourceOutputFailuresFileName, 'a') as resourceOutputFailuresFile:
                        print(e, file=resourceOutputFailuresFile)
                        failMsg = 'Failed on ' + \
                            resourceObj['type'] + \
                            ' - full resource: ' + str(resourceObj)
                        print(failMsg, file=resourceOutputFailuresFile)
                        failureList.append(failMsg)
        print("]", file=jsonOutputFile)

        # print failure list to console
        print('failure list: ' + str(failureList))


def parseDisplayElements(el, propertyObject):
    propertyObject = {'name': "", 'description': '', 'elementType': ''}
    propertyObject['elementType'] = el.name
    propertyObject['name'] = el.attrs['id'] if 'id' in el.attrs else ''
    # if el.name == 'p':
    #     propertyObject['description'] = str(el)
    # else:
    #     propertyObject['description'] = el.contents[len(el.contents) - 1]
    propertyObject['description'] = str(el)

    return propertyObject

def parseLIElements(li, propertyObject, listDepth = 1):

    # new up prop object again because it only gets newed up on on the next item
    propertyObject = {'name': "", 'description': '', 'elementType': '', "listDepth": listDepth}
    strLi = str(li)
    # if type(strLi) is not 'string':

    propertyObject['elementType'] = 'li'

    if li.code:
        propertyObject['name'] = li.code
        if li.code.contents:
            propertyObject['name'] = li.code.contents[0]
    else:
        propertyObject['name'] = li.string
    # if '(Required)' in strLi:
    #     # print(propertyObject['name'] + ' is required')
    #     propertyObject['required'] = True

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
        # print('yes its A', len(li.contents))
    else:
        # print('no', str(li))
        descStr = strLi
    
    # format description string a bit
    if descStr.startswith(' - '):
        descStr = descStr.split(' - ')[1]

    descStr = descStr.replace("(Required)", "<strong>(Required)</strong>")
    descStr = descStr.replace("(Optional)", "<strong>(Optional)</strong>")
    propertyObject['description'] = descStr

    for prop in propertyObject:
        propType = str(type(prop))
        if 'Tag' in propType:
            propertyObject[prop] = str(prop.text)
            print('Converted ' + propertyObject[prop] + ' to a string')

    return propertyObject

if __name__ == '__main__':
    main()