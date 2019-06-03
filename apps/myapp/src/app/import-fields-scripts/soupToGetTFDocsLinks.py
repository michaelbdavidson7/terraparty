print("hellow world")
import os

import os
from bs4 import BeautifulSoup
# import urllib2
import urllib.request, urllib.error




# todo get all the sidebar resources links to go through 

url = "https://www.terraform.io/docs/providers/aws/index.html"

content = urllib.request.urlopen(url).read()

soup = BeautifulSoup(content, features="html.parser")
# print(soup.prettify)
SymbolExcludeArray = ["/", "#", "None"]
tfPageAllLinks = soup.find_all("a")

with open("tfDocsLinks.txt", "a") as f:
    for link in tfPageAllLinks:
        linkConverted = str(link.get('href'))
        if linkConverted not in SymbolExcludeArray and linkConverted[0] != '#':
            print(link.get('href'), file=f)

    # print("Hello stackoverflow!", file=f)
    # print("I have a question.", file=f)
# os.startfile("./TestFile.txt", "print")

# print(soup.prettify())
print("test")