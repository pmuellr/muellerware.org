#!/usr/bin/env python

import os
import sys
import re
import base64

def get_image_data(img_name):
    ext = os.path.splitext(img_name)[1][1:]
    if ext == "jpg": ext = "jpeg"
    data_uri = "data:image/%s;base64," % ext
    
    img_file = open(img_name)
    img_bytes = img_file.read()
    img_file.close()

    img_bytes_b64 = base64.b64encode(img_bytes)
    
    return data_uri + img_bytes_b64
    
lines = sys.stdin.readlines()

img_pattern = re.compile(r'^<img\s*src="(.*?)"(.*?)>\s*$')

for line in lines:
    match = img_pattern.match(line)
    
    if not match:
        print line.rstrip()
        continue

    img_name = match.group(1)
    rest = match.group(2)
    
    img_data = get_image_data(img_name)
    line = '<img src="%s"%s>' % (img_data, rest)
    print line

