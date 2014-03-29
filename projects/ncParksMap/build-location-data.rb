#!/usr/bin/env ruby

require 'net/http'
require 'rexml/document'

#--------------------------------------------------------------------
# defines weather info
#--------------------------------------------------------------------
class Weather
  attr_reader :desc, :codes
  
  #------------------------------------------------------------------
  # initializer
  #------------------------------------------------------------------
  def initialize(desc, codes) 
    @desc  = desc
    @codes = codes
  end
  
end

#--------------------------------------------------------------------
# defines a location on the map
#--------------------------------------------------------------------
class Location

  attr_reader :name, :url, :zip, :lat, :long, :weather
  attr_writer              :zip, :lat, :long, :weather
   
  #------------------------------------------------------------------
  # initializer
  #------------------------------------------------------------------
  def initialize(name, url)
    @name = name
    @url  = url
  end
  
  #------------------------------------------------------------------
  # return string representation
  #------------------------------------------------------------------
  def to_s()
    "#{@name}\n\t#{@url}\n\t#{@zip}\n\t#{@lat}, #{@long}\n"
  end

  #------------------------------------------------------------------
  # return whether entry is complete
  #------------------------------------------------------------------
  def is_complete?()
    return false if @name.nil? || @name.empty?
    return false if @url.nil?  || @url.empty? 
    return false if @zip.nil?  || @zip.empty?
    return false if @lat.nil?  || @lat.empty?
    return false if @long.nil? || @long.empty?
    true 
  end
  
  #------------------------------------------------------------------
  # return javascript representation
  #------------------------------------------------------------------
  def to_js() 
    return <<LOCATIONTOJS
{
  "name": "#{@name}",
  "url":  "#{@url}",
  "zip":  "#{@zip}",
  "lat":  "#{@lat}",
  "long": "#{@long}",
  "weather": {
    "desc": "#{@weather.desc}",
    "codes": "[#{@weather.codes.join(',')}],"
  },
}    
LOCATIONTOJS
  end
    
end

#--------------------------------------------------------------------
# escape a json string
#--------------------------------------------------------------------
def jsEscape(string)
end

#--------------------------------------------------------------------
# main program
#--------------------------------------------------------------------
iFileName = "location-data.txt"
oFileName = "location-data.js"
kFileName = "ncStateParks.kml"

if (!File.exists?(iFileName))
  puts("File '#{iFileName}' not found.")
  exit
end

#--------------------------------------------------------------------
# read the input file
#--------------------------------------------------------------------
lines = IO.readlines(iFileName)

locations = []
currLocation = nil
lines.each { |line|
  next if (line =~ /^\s*#/)

  if (line =~ /^\w/)
    words = line.split()
    url  = words.shift
    name = words.join(' ')
    currLocation = Location.new(name, url)
    locations.push(currLocation)

  elsif (line =~ /^\s*zip:/)
    currLocation.zip = line.split(':').last.strip

  elsif (line =~ /^\s*lat:/)
    currLocation.lat = line.split(':').last.strip

  elsif (line =~ /^\s*long:/)
    currLocation.long = line.split(':').last.strip
    
  end
}

#--------------------------------------------------------------------
# print incomplete entries
#--------------------------------------------------------------------
newLocations = []

locations.each { | location |
    if location.is_complete?
      newLocations.push(location)
    else 
      puts "incomplete entry: #{location}"
    end
}

locations = newLocations

#--------------------------------------------------------------------
# get weather data
#--------------------------------------------------------------------
locations.each { | location |
  zip = location.zip
  
  puts("Getting weather for #{location.name}")
  xml  = Net::HTTP.get("xml.weather.yahoo.com", "/forecastrss?p=#{zip}")
  doc  = REXML::Document.new xml
  root = doc.root

  desc = root.elements['channel/item/description'].text
  codes = []
  
  codes.push(root.elements['channel/item/yweather:condition'].attributes['code'])
  
  doc.elements.each("channel/item/yweather:forecast") { |forecast|
    code = forecast.attributes['code']
    codes.push(code)
  }

  location.weather = Weather.new(desc, codes)
}

#--------------------------------------------------------------------
# write the output file
#--------------------------------------------------------------------
File.open(oFileName,"w") { | file |
  file.puts("LocationData = [")
  
  locations.each { |location|
  
    file.puts(location.to_js + ',')
  }
  
  file.puts("]")
}

#--------------------------------------------------------------------
# write the .kml file
#--------------------------------------------------------------------
File.open(kFileName,"w") { | file |
  file.puts("<?xml version='1.0' encoding='UTF-8'?>")
  file.puts("<kml xmlns='http://earth.google.com/kml/2.1'>")
  file.puts("\t<Document>")
  file.puts("\t\t<name>North Carolina State Parks</name>")
  file.puts("\t\t<Folder>")
  file.puts("\t\t\t<name>North Carolina State Parks</name>")
  file.puts("\t\t\t<open>1</open>")
  file.puts("\t\t\t<description>State parks of North Carolina.</description>")

  locations.each { |location|
    file.puts("\t\t\t<Placemark>")
    file.puts("\t\t\t\t<name>#{location.name}</name>")
    file.puts("\t\t\t\t<description><![CDATA[#{location.weather.desc}]]></description>")
    file.puts("\t\t\t\t<Point>")
    file.puts("\t\t\t\t\t<coordinates>#{location.long},#{location.lat},0</coordinates>")
    file.puts("\t\t\t\t</Point>")
    file.puts("\t\t\t</Placemark>")
  }
  
  file.puts("\t\t</Folder>")
  file.puts("\t</Document>")
  file.puts("</kml>")
  
}

#--------------------------------------------------------------------
# write summary
#--------------------------------------------------------------------
puts "Wrote #{locations.size} locations to #{oFileName} and #{kFileName}"